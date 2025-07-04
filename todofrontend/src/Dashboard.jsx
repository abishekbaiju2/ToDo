import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Router, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";

const Dashboard = () => {
  const [tasks, setTasks] = useState([])

  const [stats, setStats] = useState({ completed: 0, incomplete: 0 })

  const navigate = useNavigate()

  const [newTask, setNewTask] = useState('');

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [editedTitle, setEditedTitle] = useState('');

  let access = localStorage.getItem('access')

  const refresh = localStorage.getItem('refresh')


  const chartData = [
    { name: 'Completed', value: stats.completed, color: ' #2563eb' },
    { name: 'Incomplete', value: stats.incomplete, color: " #7e22ce" },
  ]


  async function handletokenrefresh() {
    try {
      let response = await axios.post('http://127.0.0.1:8000/api/todo/token/refresh/', { refresh })
      const newtoken = response.data.access
      localStorage.setItem('access', newtoken)
      access = newtoken
      return newtoken
    } catch (error) {
      localStorage.clear()
      navigate('/')
    }
  }


  const authRequest = async (method, url, data = null) => {
    try {
      const config = {
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${access}` },
      };
      let response = await axios(config);
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await handletokenrefresh();
        const retryConfig = {
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${newToken}` },
        };
        return await axios(retryConfig);
      } else {
        throw error;
      }
    }
  };


  async function fetchTasks() {
    let response = await authRequest('GET', 'http://127.0.0.1:8000/api/todo/taskslistcreate/')
    setTasks(response.data)
  }


  async function fetchStats() {
    let response = await authRequest('GET', 'http://127.0.0.1:8000/api/todo/tasks/stats/')
    setStats(response.data)
  }

 useEffect(() => {
    fetchTasks();
    fetchStats()
  }, []);

  async function logout() {
    await authRequest('POST', "http://127.0.0.1:8000/api/todo/logout/")
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    navigate('/')
  }


  async function handlecreate() {
    if (!newTask.trim()) return
    await authRequest('POST', 'http://127.0.0.1:8000/api/todo/taskslistcreate/', { title: newTask })
    setNewTask("")
    fetchTasks()
    fetchStats()
  }


  async function handledelete(id) {
    await authRequest('DELETE', `http://127.0.0.1:8000/api/todo/tasks/delete/${id}/`)
    fetchTasks()
    fetchStats()
  }

  async function handlecomplete(id) {
    await authRequest('POST', `http://127.0.0.1:8000/api/todo/tasks/complete/${id}/`)
    fetchTasks()
    fetchStats()
  }

  async function fetchIncompleteTasks(){
  let response = await authRequest('GET','http://127.0.0.1:8000/api/todo/incomplete/')
  setTasks(response.data)
}

  async function fetchCompletedTasks(){
  let response = await authRequest('GET','http://127.0.0.1:8000/api/todo/completed/')
  setTasks(response.data)
}

  async function handleupdate(id) {
    if (!editedTitle.trim()) return
    await authRequest("PUT", `http://127.0.0.1:8000/api/todo/tasks/update/${id}/`, { title: editedTitle })
    setEditingTaskId(null)
    setEditedTitle('')
    fetchTasks()
    fetchStats()
  }
 

  return (
<div className='container-fluid d-flex justify-content-center align-items-center vh-100'>
  <div className='rounded-4 border shadow bg-white w-100 w-md-75 w-lg-50'>

    {/* Header */}
<div className="p-4 text-white rounded-top-4 d-flex justify-content-between align-items-center todo1 w-100">
  <div>
    <h2 className="mb-1">My Tasks</h2>
    <p className="mb-0 small text-white-50">Stay organized and productive</p>
  </div>
  <button className="btn btn-outline-light btn-sm" onClick={logout}>
    <i className="fa-solid fa-right-from-bracket"></i>
  </button>
</div>
    {/* Input Form */}
    <form className="container-fluid input-group mb-3 mt-2 px-3" onSubmit={handlecreate}>
      <input
        type="text"
        className="form-control"
        placeholder="What needs to be done?"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button className='btn btn-primary w-25' type='submit'>ADD</button>
    </form>

    {/* Filter Tabs */}
    <div className="d-flex flex-wrap justify-content-center gap-2 px-3 mb-3">
      <button type="button" className="btn btn-outline-secondary" onClick={fetchTasks}>All</button>
      <button type="button" className="btn btn-outline-secondary" onClick={fetchIncompleteTasks}>Active</button>
      <button type="button" className="btn btn-outline-secondary" onClick={fetchCompletedTasks}>Completed</button>
    </div>

    {/* Task List */}
    <div className="list-group mb-4 container-fluid px-3 todo">
      {tasks.length === 0 ? (
        <div className="text-center text-muted">No tasks to display.</div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="mb-2 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center p-2 border rounded"
          >
            <div className="d-flex align-items-center w-100 mb-2 mb-md-0">
              <input
                type="checkbox"
                className="form-check-input me-2"
                checked={task.completed}
                onChange={() => handlecomplete(task.id)}
              />

              {editingTaskId === task.id ? (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              ) : (
                <span
                  className="ms-1"
                  style={{
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}
                >
                  {task.title}
                </span>
              )}
            </div>
            <div className="d-flex justify-content-end w-100 w-md-auto">
              {editingTaskId === task.id ? (
                <>
                  <button className="btn btn-sm btn-success me-1" onClick={() => handleupdate(task.id)}>
                    <FaSave />
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditingTaskId(null)}>
                    <FaTimes />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-outline-primary me-1"
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setEditedTitle(task.title);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button className="btn btn-outline-danger" onClick={() => handledelete(task.id)}>
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>

    {/* Stats + Chart */}
    <div className='rounded-bottom-4 down p-3'>
      <div className='row text-center text-sm-start'>
        <div className='col-sm-6 col-lg-4 mb-3 mb-lg-0'>
          <div>
            <span className="total fw-bold">{stats.completed + stats.incomplete}</span>
            <span className="text-muted" style={{ fontSize: '14px' }}> total</span>
            <span className="active ms-3 fw-bold">{stats.incomplete}</span>
            <span className="text-muted" style={{ fontSize: '14px' }}> active</span>
            <span className="completed ms-3 fw-bold">{stats.completed}</span>
            <span className="text-muted" style={{ fontSize: '14px' }}> completed</span>
          </div>
          <div className="d-flex mt-3 align-items-start">
            <i className="fas fa-adjust mt-1"></i>
            <div className='ms-2' style={{ fontSize: '13px' }}>
              Progress <br /> Overview
            </div>
          </div>
        </div>

        <div className='col-sm-6 col-lg-4 d-flex justify-content-center mb-3 mb-lg-0'>
          <div className="shadow-md rounded-lg">
            <PieChart width={80} height={80}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={17}
                outerRadius={40}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className='col-12 col-lg-4 d-flex justify-content-center align-items-center'>
          <div className='text-center'>
            <span className="percentage fw-bold ">
              {Math.round((stats.completed / (stats.completed + stats.incomplete)) * 100)}%
            </span>
            <div className="text-muted" style={{ fontSize: '14px' }}>completed</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>


  )
}

export default Dashboard;