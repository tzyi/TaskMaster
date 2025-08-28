import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const Project = () => {
  const { type } = useParams();
  
  const projectInfo = {
    work: {
      title: '工作項目',
      icon: 'fas fa-briefcase',
      color: 'text-red-500',
      description: '管理您的工作相關任務和專案'
    },
    personal: {
      title: '個人成長',
      icon: 'fas fa-user-graduate',
      color: 'text-green-500',
      description: '追蹤個人學習和成長目標'
    },
    health: {
      title: '健康生活',
      icon: 'fas fa-heart',
      color: 'text-blue-500',
      description: '管理健康和運動相關的目標'
    }
  };

  const project = projectInfo[type] || projectInfo.work;

  return (
    <PageLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
        <p className="text-gray-600 mb-6">{project.description}</p>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <i className={`${project.icon} text-6xl ${project.color} mb-4`}></i>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{project.title}</h2>
            <p className="text-gray-600">
              這裡將顯示 {project.title} 的詳細內容和任務列表
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Project;