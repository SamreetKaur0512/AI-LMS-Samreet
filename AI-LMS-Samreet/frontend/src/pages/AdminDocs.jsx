import React, { useState } from 'react'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'

const AdminDocs = () => {
  const [openSections, setOpenSections] = useState({})

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = [
    {
      id: 'ai-tutor-logs',
      title: 'Monitoring AI Tutor Logs',
      content: `
        <h3 class="text-lg font-semibold mb-2">Accessing AI Tutor Logs</h3>
        <p class="mb-4">Navigate to the Admin Dashboard → AI Analytics tab to view comprehensive logs of AI tutor interactions.</p>
        
        <h3 class="text-lg font-semibold mb-2">Key Metrics to Monitor</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Total conversations per day/week</li>
          <li>User satisfaction ratings</li>
          <li>Common query categories</li>
          <li>Response accuracy scores</li>
          <li>Error rates and failed interactions</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Troubleshooting</h3>
        <p>If AI tutor response quality declines:</p>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Check API rate limits</li>
          <li>Review recent training data updates</li>
          <li>Monitor server performance metrics</li>
          <li>Analyze user feedback patterns</li>
        </ul>
      `
    },
    {
      id: 'ai-quiz-settings',
      title: 'Managing AI Quiz Settings',
      content: `
        <h3 class="text-lg font-semibold mb-2">Quiz Generation Parameters</h3>
        <p class="mb-4">Configure AI quiz generation through the Admin Panel → AI Settings.</p>
        
        <h3 class="text-lg font-semibold mb-2">Difficulty Levels</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li><strong>Beginner:</strong> Basic concepts, multiple choice</li>
          <li><strong>Intermediate:</strong> Applied knowledge, short answers</li>
          <li><strong>Advanced:</strong> Complex problem-solving, coding challenges</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Customization Options</h3>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Question count per quiz (5-20)</li>
          <li>Time limits per question</li>
          <li>Topic-specific weighting</li>
          <li>Adaptive difficulty scaling</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Quality Assurance</h3>
        <p>Regularly review generated quizzes for:</p>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Accuracy of questions</li>
          <li>Clarity of explanations</li>
          <li>Appropriate difficulty progression</li>
          <li>Cultural sensitivity and inclusivity</li>
        </ul>
      `
    },
    {
      id: 'db-troubleshooting',
      title: 'Database Troubleshooting',
      content: `
        <h3 class="text-lg font-semibold mb-2">Common Database Issues</h3>
        
        <h4 class="text-md font-semibold mb-2">Connection Problems</h4>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Check database server status</li>
          <li>Verify connection string configuration</li>
          <li>Review firewall settings</li>
          <li>Monitor network connectivity</li>
        </ul>
        
        <h4 class="text-md font-semibold mb-2">Performance Issues</h4>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Analyze slow query logs</li>
          <li>Check index usage and optimization</li>
          <li>Monitor disk I/O and memory usage</li>
          <li>Review database server configuration</li>
        </ul>
        
        <h4 class="text-md font-semibold mb-2">Data Integrity</h4>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Run regular integrity checks</li>
          <li>Monitor for orphaned records</li>
          <li>Validate foreign key constraints</li>
          <li>Check for data corruption</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Backup and Recovery</h3>
        <p class="mb-4">Maintain regular backups:</p>
        <ul class="list-disc list-inside mb-4 space-y-1">
          <li>Daily incremental backups</li>
          <li>Weekly full backups</li>
          <li>Test restoration procedures monthly</li>
          <li>Store backups in multiple locations</li>
        </ul>
        
        <h3 class="text-lg font-semibold mb-2">Emergency Procedures</h3>
        <ol class="list-decimal list-inside mb-4 space-y-1">
          <li>Isolate the affected system</li>
          <li>Assess the scope of the issue</li>
          <li>Execute recovery from latest backup</li>
          <li>Validate data integrity post-recovery</li>
          <li>Document the incident and resolution</li>
        </ol>
      `
    }
  ]

  return (
    <div className="min-h-screen bg-richblack-900 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-richblack-800 p-6 border-r border-richblack-700">
        <h1 className="text-2xl font-bold mb-6 text-yellow-400">Admin Documentation</h1>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-richblack-700 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium">{section.title}</span>
              {openSections[section.id] ? (
                <FaChevronDown className="w-5 h-5" />
              ) : (
                <FaChevronRight className="w-5 h-5" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl">
          {sections.map((section) => (
            openSections[section.id] && (
              <div key={section.id} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">{section.title}</h2>
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            )
          ))}
          
          {!Object.values(openSections).some(Boolean) && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4 text-richblack-400">Select a section from the sidebar</h2>
              <p className="text-richblack-500">Choose a topic to view detailed documentation and guides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDocs