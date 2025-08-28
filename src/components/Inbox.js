import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import PageLayout from './PageLayout';

const PRIORITY_OPTIONS = [
  { value: 1, label: '緊急且重要', color: 'bg-red-100 text-red-800', icon: 'fas fa-exclamation-triangle', border: 'border-red-500' },
  { value: 2, label: '重要但不緊急', color: 'bg-orange-100 text-orange-800', icon: 'fas fa-star', border: 'border-orange-500' },
  { value: 3, label: '緊急但不重要', color: 'bg-yellow-100 text-yellow-800', icon: 'fas fa-clock', border: 'border-yellow-500' },
  { value: 4, label: '不緊急也不重要', color: 'bg-gray-100 text-gray-800', icon: 'fas fa-circle', border: 'border-gray-300' }
];

const SORT_OPTIONS = [
  { value: 'due_date', label: '截止日期' },
  { value: 'created_at', label: '建立日期' },
  { value: 'sort_order', label: '自訂排序' }
];

const Inbox = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('due_date');
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [labelFilter, setLabelFilter] = useState(null);
  
  // 任務輸入狀態
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 4,
    labels: [],
    subtasks: []
  });
  
  // Modal任務狀態
  const [modalTask, setModalTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 4,
    labels: [],
    subtasks: []
  });

  const [subtaskInput, setSubtaskInput] = useState('');
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  
  // 編輯任務狀態
  const [editingTask, setEditingTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskData, setEditTaskData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 4,
    labels: [],
    subtasks: []
  });

  // 獲取任務列表
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('正在獲取任務列表...');
      
      // 先檢查tasks表是否存在
      const { data: testData, error: testError } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Tasks表不存在或無法訪問:', testError);
        setTasks([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('tasks')
        .select(`
          *,
          task_labels (
            label_id,
            labels (id, name, color)
          )
        `)
        .eq('user_id', user.id)
        .is('parent_task_id', null);

      // 排序
      if (sortBy === 'due_date') {
        query = query.order('due_date', { ascending: true, nullsLast: true });
      } else if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('sort_order', { ascending: true });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
        return;
      }

      console.log('獲取到任務數量:', data?.length || 0);

      // 獲取子任務
      const taskIds = data?.map(task => task.id) || [];
      if (taskIds.length > 0) {
        const { data: subtasksData, error: subtasksError } = await supabase
          .from('tasks')
          .select('*')
          .in('parent_task_id', taskIds)
          .order('created_at', { ascending: true });

        if (subtasksError) {
          console.error('Error fetching subtasks:', subtasksError);
        } else {
          // 將子任務組織到父任務中
          const tasksWithSubtasks = data.map(task => ({
            ...task,
            subtasks: subtasksData.filter(subtask => subtask.parent_task_id === task.id)
          }));
          
          setTasks(tasksWithSubtasks);
        }
      } else {
        setTasks(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, sortBy]);

  // 獲取標籤列表
  const fetchLabels = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('正在獲取標籤列表...');
      
      // 先檢查labels表是否存在
      const { data: testData, error: testError } = await supabase
        .from('labels')
        .select('id')
        .limit(1);

      if (testError) {
        console.error('Labels表不存在或無法訪問:', testError);
        setLabels([]);
        return;
      }

      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error fetching labels:', error);
      } else {
        console.log('獲取到標籤數量:', data?.length || 0);
        setLabels(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user]);

  // 添加任務
  const addTask = async (taskData, isModal = false) => {
    console.log('開始添加任務:', taskData);
    
    if (!user) {
      console.error('用戶未登入');
      alert('請先登入');
      return;
    }
    
    if (!taskData.title.trim()) {
      console.error('任務標題為空');
      alert('請輸入任務標題');
      return;
    }

    try {
      console.log('準備插入任務到資料庫...');
      
      // 準備任務資料
      const taskToInsert = {
        user_id: user.id,
        title: taskData.title.trim(),
        description: (taskData.description || '').trim(),
        due_date: taskData.due_date || null,
        priority: taskData.priority || 4,
        sort_order: tasks.length
      };
      
      console.log('任務資料:', taskToInsert);

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert([taskToInsert])
        .select()
        .single();

      if (taskError) {
        console.error('建立任務時發生錯誤:', taskError);
        alert(`建立任務失敗: ${taskError.message}`);
        return;
      }

      console.log('任務建立成功:', taskResult);

      // 添加標籤關聯
      if (taskData.labels && taskData.labels.length > 0) {
        console.log('添加標籤關聯:', taskData.labels);
        const labelInserts = taskData.labels.map(labelId => ({
          task_id: taskResult.id,
          label_id: labelId
        }));

        const { error: labelError } = await supabase
          .from('task_labels')
          .insert(labelInserts);

        if (labelError) {
          console.error('添加標籤關聯時發生錯誤:', labelError);
        } else {
          console.log('標籤關聯添加成功');
        }
      }

      // 添加子任務
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        console.log('添加子任務:', taskData.subtasks);
        const subtaskInserts = taskData.subtasks.map((subtask, index) => ({
          user_id: user.id,
          title: subtask.trim(),
          parent_task_id: taskResult.id,
          sort_order: index
        }));

        const { error: subtaskError } = await supabase
          .from('tasks')
          .insert(subtaskInserts);

        if (subtaskError) {
          console.error('建立子任務時發生錯誤:', subtaskError);
        } else {
          console.log('子任務建立成功');
        }
      }

      // 重置表單
      const resetData = {
        title: '',
        description: '',
        due_date: '',
        priority: 4,
        labels: [],
        subtasks: []
      };

      if (isModal) {
        setModalTask(resetData);
        setShowModal(false);
        console.log('Modal已關閉，表單已重置');
      } else {
        setNewTask(resetData);
        console.log('快速輸入表單已重置');
      }

      // 重新獲取任務列表
      console.log('重新獲取任務列表...');
      await fetchTasks();
      
      console.log('任務添加流程完成！');
      
    } catch (error) {
      console.error('添加任務時發生未預期的錯誤:', error);
      alert(`發生錯誤: ${error.message}`);
    }
  };

  // 切換任務完成狀態
  const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !isCompleted })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
      } else {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 切換子任務完成狀態
  const toggleSubtaskCompletion = async (subtaskId, isCompleted) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !isCompleted })
        .eq('id', subtaskId);

      if (error) {
        console.error('Error updating subtask:', error);
      } else {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 刪除任務
  const deleteTask = async (taskId, taskTitle) => {
    // 確認對話框
    const confirmed = window.confirm(`確定要刪除任務「${taskTitle}」嗎？\n\n此操作將同時刪除所有子任務，且無法復原。`);
    
    if (!confirmed) {
      return;
    }

    try {
      console.log(`開始刪除任務: ${taskId}`);

      // 由於資料庫設定了CASCADE DELETE，刪除父任務時會自動刪除：
      // 1. 所有子任務 (tasks表中parent_task_id關聯)
      // 2. 所有標籤關聯 (task_labels表中task_id關聯)
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('刪除任務時發生錯誤:', error);
        alert(`刪除任務失敗: ${error.message}`);
        return;
      }

      console.log('任務刪除成功');
      
      // 重新獲取任務列表
      await fetchTasks();
      
    } catch (error) {
      console.error('刪除任務時發生未預期的錯誤:', error);
      alert(`發生錯誤: ${error.message}`);
    }
  };

  // 刪除子任務
  const deleteSubtask = async (subtaskId, subtaskTitle, e) => {
    e.stopPropagation();
    
    // 確認對話框
    const confirmed = window.confirm(`確定要刪除子任務「${subtaskTitle}」嗎？\n\n此操作無法復原。`);
    
    if (!confirmed) {
      return;
    }

    try {
      console.log(`開始刪除子任務: ${subtaskId}`);

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', subtaskId);

      if (error) {
        console.error('刪除子任務時發生錯誤:', error);
        alert(`刪除子任務失敗: ${error.message}`);
        return;
      }

      console.log('子任務刪除成功');
      
      // 重新獲取任務列表
      await fetchTasks();
      
    } catch (error) {
      console.error('刪除子任務時發生未預期的錯誤:', error);
      alert(`發生錯誤: ${error.message}`);
    }
  };

  // 打開編輯任務Modal
  const openEditModal = (task) => {
    console.log('開始編輯任務:', task);
    
    setEditingTask(task);
    
    // 預填任務資料
    setEditTaskData({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
      priority: task.priority || 4,
      labels: task.task_labels?.map(tl => tl.label_id) || [],
      subtasks: task.subtasks?.map(st => st.title) || []
    });
    
    setShowEditModal(true);
  };

  // 更新任務
  const updateTask = async () => {
    if (!editingTask || !editTaskData.title.trim()) {
      alert('請輸入任務標題');
      return;
    }

    try {
      console.log('開始更新任務:', editingTask.id);
      console.log('更新資料:', editTaskData);

      // 1. 更新主任務
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          title: editTaskData.title.trim(),
          description: editTaskData.description.trim(),
          due_date: editTaskData.due_date || null,
          priority: editTaskData.priority
        })
        .eq('id', editingTask.id);

      if (taskError) {
        console.error('更新任務時發生錯誤:', taskError);
        alert(`更新任務失敗: ${taskError.message}`);
        return;
      }

      // 2. 更新標籤關聯
      // 先刪除現有的標籤關聯
      const { error: deleteLabelError } = await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', editingTask.id);

      if (deleteLabelError) {
        console.error('刪除舊標籤關聯時發生錯誤:', deleteLabelError);
      }

      // 添加新的標籤關聯
      if (editTaskData.labels.length > 0) {
        const labelInserts = editTaskData.labels.map(labelId => ({
          task_id: editingTask.id,
          label_id: labelId
        }));

        const { error: labelError } = await supabase
          .from('task_labels')
          .insert(labelInserts);

        if (labelError) {
          console.error('更新標籤關聯時發生錯誤:', labelError);
        }
      }

      // 3. 更新子任務
      // 先刪除所有現有子任務
      const { error: deleteSubtasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('parent_task_id', editingTask.id);

      if (deleteSubtasksError) {
        console.error('刪除舊子任務時發生錯誤:', deleteSubtasksError);
      }

      // 添加新的子任務
      if (editTaskData.subtasks.length > 0) {
        const subtaskInserts = editTaskData.subtasks.map((subtask, index) => ({
          user_id: user.id,
          title: String(subtask).trim(),
          parent_task_id: editingTask.id,
          sort_order: index,
          priority: 4,
          is_completed: false
        }));

        const { error: subtaskError } = await supabase
          .from('tasks')
          .insert(subtaskInserts);

        if (subtaskError) {
          console.error('更新子任務時發生錯誤:', subtaskError);
        }
      }

      console.log('任務更新成功');

      // 關閉編輯Modal
      setShowEditModal(false);
      setEditingTask(null);
      setEditTaskData({
        title: '',
        description: '',
        due_date: '',
        priority: 4,
        labels: [],
        subtasks: []
      });

      // 重新獲取任務列表
      await fetchTasks();

    } catch (error) {
      console.error('更新任務時發生未預期的錯誤:', error);
      alert(`發生錯誤: ${error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchLabels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  // 篩選任務
  const filteredTasks = tasks.filter(task => {
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (labelFilter && !task.task_labels?.some(tl => tl.label_id === labelFilter)) return false;
    return true;
  });

  const completedTasks = filteredTasks.filter(task => task.is_completed);
  const activeTasks = filteredTasks.filter(task => !task.is_completed);

  // 處理快速輸入的Enter鍵
  const handleQuickAddEnter = (e) => {
    if (e.key === 'Enter' && newTask.title.trim()) {
      addTask(newTask);
    }
  };

  // 格式化日期顯示
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    } else {
      return date.toLocaleDateString('zh-TW');
    }
  };

  // 判斷日期是否逾期
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date < today;
  };

  // 渲染任務項目
  const renderTask = (task) => {
    const priority = PRIORITY_OPTIONS.find(p => p.value === task.priority);
    const taskLabels = task.task_labels?.map(tl => tl.labels).filter(Boolean) || [];
    const completedSubtasks = task.subtasks?.filter(st => st.is_completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    return (
      <div 
        key={task.id} 
        className={`group bg-white rounded-lg shadow-sm border ${task.is_completed ? 'opacity-60 bg-gray-50' : ''} ${priority.border} border-l-4 p-4 transition-all hover:shadow-md`}
      >
        <div className="flex items-start space-x-3">
          <button
            onClick={() => toggleTaskCompletion(task.id, task.is_completed)}
            className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-colors ${
              task.is_completed 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-300 hover:border-orange-500'
            }`}
          >
            {task.is_completed && <i className="fas fa-check text-white text-xs"></i>}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <h3 className={`font-medium ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {/* 編輯按鈕 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(task);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600"
                  title="編輯任務"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <i className={`${priority.icon} text-sm`} style={{color: priority.color.includes('red') ? '#dc2626' : priority.color.includes('orange') ? '#ea580c' : priority.color.includes('yellow') ? '#ca8a04' : '#6b7280'}}></i>
                <span className={`px-2 py-1 text-xs rounded-full ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
            </div>
            
            {task.description && (
              <p className={`text-sm mt-1 ${task.is_completed ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}

            {/* 子任務 */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 ml-2 space-y-2">
                {task.subtasks.map(subtask => (
                  <div key={subtask.id} className="group/subtask flex items-center space-x-2 hover:bg-gray-50 rounded px-1 py-1 -mx-1">
                    <button
                      onClick={() => toggleSubtaskCompletion(subtask.id, subtask.is_completed)}
                      className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-colors ${
                        subtask.is_completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-orange-500'
                      }`}
                    >
                      {subtask.is_completed && <i className="fas fa-check text-white text-xs"></i>}
                    </button>
                    <span className={`text-sm flex-1 ${subtask.is_completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                      {subtask.title}
                    </span>
                    {/* 子任務刪除按鈕 */}
                    <button
                      onClick={(e) => deleteSubtask(subtask.id, subtask.title, e)}
                      className="opacity-0 group-hover/subtask:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                      title="刪除子任務"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 任務信息和操作按鈕 */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {task.due_date && (
                  <span className={`flex items-center space-x-1 ${isOverdue(task.due_date) && !task.is_completed ? 'text-red-600' : ''}`}>
                    <i className="far fa-calendar"></i>
                    <span>{formatDate(task.due_date)}</span>
                    {isOverdue(task.due_date) && !task.is_completed && <i className="fas fa-exclamation-triangle text-red-600"></i>}
                  </span>
                )}
                
                {taskLabels.length > 0 && (
                  <div className="flex items-center space-x-1">
                    {taskLabels.map(label => (
                      <span 
                        key={label.id}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${label.color}20`,
                          color: label.color
                        }}
                      >
                        #{label.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {totalSubtasks > 0 && (
                  <span className="flex items-center space-x-1">
                    <i className="fas fa-list text-xs"></i>
                    <span>{completedSubtasks}/{totalSubtasks} 完成</span>
                  </span>
                )}
              </div>
              
              {/* 刪除按鈕 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id, task.title);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                title="刪除任務"
              >
                <i className="fas fa-trash text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">收集箱</h2>
            <p className="text-gray-600 mt-1">管理您的所有待辦事項</p>
          </div>
          
          {/* 控制按鈕 */}
          <div className="flex items-center space-x-2">
            {/* 排序 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* 優先級篩選 */}
            <select
              value={priorityFilter || ''}
              onChange={(e) => setPriorityFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">所有優先級</option>
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* 標籤篩選 */}
            <select
              value={labelFilter || ''}
              onChange={(e) => setLabelFilter(e.target.value || null)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border-0 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">所有標籤</option>
              {labels.map(label => (
                <option key={label.id} value={label.id}>#{label.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 快速添加任務 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
            <input
              type="text"
              placeholder="添加任務..."
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              onKeyPress={handleQuickAddEnter}
              className="flex-1 text-gray-700 placeholder-gray-500 border-0 focus:outline-none"
            />
            
            {/* 快速選項 */}
            <input
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
              className="text-gray-400 border-0 focus:outline-none hover:text-orange-500"
            />
            
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              className="text-gray-400 border-0 focus:outline-none hover:text-orange-500 bg-transparent"
            >
              {PRIORITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {newTask.title.trim() && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('快速添加按鈕被點擊');
                  console.log('快速任務資料:', newTask);
                  addTask(newTask);
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                添加
              </button>
            )}
          </div>
        </div>

        {/* 任務列表 */}
        <div className="space-y-3 mb-8">
          {activeTasks.map(renderTask)}
        </div>

        {/* 已完成任務區域 */}
        {completedTasks.length > 0 && (
          <div>
            <button
              onClick={() => setShowCompletedTasks(!showCompletedTasks)}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-4"
            >
              <i className={`fas fa-chevron-${showCompletedTasks ? 'down' : 'right'} text-xs`}></i>
              <span className="font-medium">已完成 ({completedTasks.length})</span>
            </button>
            
            {showCompletedTasks && (
              <div className="space-y-3">
                {completedTasks.map(renderTask)}
              </div>
            )}
          </div>
        )}

        {/* 空狀態 */}
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">收集箱是空的</h3>
            <p className="text-gray-600">點擊上方輸入框或右下角的 + 按鈕來添加第一個任務</p>
          </div>
        )}
      </div>

      {/* 浮動添加按鈕 */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
      >
        <i className="fas fa-plus text-xl"></i>
      </button>

      {/* 添加任務 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">添加新任務</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="任務標題..."
                  value={modalTask.title}
                  onChange={(e) => setModalTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                
                <textarea
                  placeholder="詳細描述..."
                  value={modalTask.description}
                  onChange={(e) => setModalTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                    <input
                      type="date"
                      value={modalTask.due_date}
                      onChange={(e) => setModalTask(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">重要程度</label>
                    <select
                      value={modalTask.priority}
                      onChange={(e) => setModalTask(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {PRIORITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 標籤選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <button
                        key={label.id}
                        onClick={() => {
                          const newLabels = modalTask.labels.includes(label.id)
                            ? modalTask.labels.filter(id => id !== label.id)
                            : [...modalTask.labels, label.id];
                          setModalTask(prev => ({ ...prev, labels: newLabels }));
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          modalTask.labels.includes(label.id)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 text-gray-600 hover:border-orange-500'
                        }`}
                      >
                        #{label.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 子任務 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">子任務</label>
                  <div className="space-y-2">
                    {modalTask.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 flex-1">{subtask}</span>
                        <button
                          onClick={() => {
                            const newSubtasks = modalTask.subtasks.filter((_, i) => i !== index);
                            setModalTask(prev => ({ ...prev, subtasks: newSubtasks }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="添加子任務..."
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && subtaskInput.trim()) {
                            setModalTask(prev => ({ 
                              ...prev, 
                              subtasks: [...prev.subtasks, subtaskInput.trim()] 
                            }));
                            setSubtaskInput('');
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      {subtaskInput.trim() && (
                        <button
                          onClick={() => {
                            setModalTask(prev => ({ 
                              ...prev, 
                              subtasks: [...prev.subtasks, subtaskInput.trim()] 
                            }));
                            setSubtaskInput('');
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('添加任務按鈕被點擊');
                    console.log('Modal任務資料:', modalTask);
                    console.log('用戶資料:', user);
                    addTask(modalTask, true);
                  }}
                  disabled={!modalTask.title.trim()}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加任務
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編輯任務 Modal */}
      {showEditModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">編輯任務</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="任務標題..."
                  value={editTaskData.title}
                  onChange={(e) => setEditTaskData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                
                <textarea
                  placeholder="詳細描述..."
                  value={editTaskData.description}
                  onChange={(e) => setEditTaskData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
                    <input
                      type="date"
                      value={editTaskData.due_date}
                      onChange={(e) => setEditTaskData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">重要程度</label>
                    <select
                      value={editTaskData.priority}
                      onChange={(e) => setEditTaskData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {PRIORITY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 標籤選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">標籤</label>
                  <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                      <button
                        key={label.id}
                        onClick={() => {
                          const newLabels = editTaskData.labels.includes(label.id)
                            ? editTaskData.labels.filter(id => id !== label.id)
                            : [...editTaskData.labels, label.id];
                          setEditTaskData(prev => ({ ...prev, labels: newLabels }));
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          editTaskData.labels.includes(label.id)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 text-gray-600 hover:border-orange-500'
                        }`}
                      >
                        #{label.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 子任務編輯 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">子任務</label>
                  <div className="space-y-2">
                    {editTaskData.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 flex-1">{subtask}</span>
                        <button
                          onClick={() => {
                            const newSubtasks = editTaskData.subtasks.filter((_, i) => i !== index);
                            setEditTaskData(prev => ({ ...prev, subtasks: newSubtasks }));
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="添加子任務..."
                        value={subtaskInput}
                        onChange={(e) => setSubtaskInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && subtaskInput.trim()) {
                            setEditTaskData(prev => ({ 
                              ...prev, 
                              subtasks: [...prev.subtasks, subtaskInput.trim()] 
                            }));
                            setSubtaskInput('');
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                      {subtaskInput.trim() && (
                        <button
                          onClick={() => {
                            setEditTaskData(prev => ({ 
                              ...prev, 
                              subtasks: [...prev.subtasks, subtaskInput.trim()] 
                            }));
                            setSubtaskInput('');
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  取消
                </button>
                <button
                  onClick={updateTask}
                  disabled={!editTaskData.title.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  更新任務
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Inbox;
