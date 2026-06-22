import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'todo-webapp-data'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        topics: parsed.topics || [],
        savings: parsed.savings || { saved: '', goal: '10000' },
      }
    }
  } catch (e) { /* ignore */ }
  return { topics: [], savings: { saved: '', goal: '10000' } }
}

export default function App() {
  const [data, setData] = useState(loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const addTopic = (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const id = crypto.randomUUID()
    setData(d => ({
      ...d,
      topics: [...d.topics, { id, name: trimmed, tasks: [] }],
    }))
    return id
  }

  const renameTopic = (topicId, newName) => {
    setData(d => ({
      ...d,
      topics: d.topics.map(t => t.id === topicId ? { ...t, name: newName } : t),
    }))
  }

  const deleteTopic = (topicId) => {
    setData(d => ({ ...d, topics: d.topics.filter(t => t.id !== topicId) }))
  }

  const addTask = (topicId, text) => {
    const trimmed = text.trim()
    if (!trimmed) return null
    const id = crypto.randomUUID()
    setData(d => ({
      ...d,
      topics: d.topics.map(t =>
        t.id === topicId
          ? { ...t, tasks: [...t.tasks, { id, text: trimmed, done: false }] }
          : t
      ),
    }))
    return id
  }

  const updateTask = (topicId, taskId, text) => {
    setData(d => ({
      ...d,
      topics: d.topics.map(t =>
        t.id === topicId
          ? { ...t, tasks: t.tasks.map(task => task.id === taskId ? { ...task, text } : task) }
          : t
      ),
    }))
  }

  const toggleTask = (topicId, taskId) => {
    setData(d => ({
      ...d,
      topics: d.topics.map(t =>
        t.id === topicId
          ? { ...t, tasks: t.tasks.map(task => task.id === taskId ? { ...task, done: !task.done } : task) }
          : t
      ),
    }))
  }

  const deleteTask = (topicId, taskId) => {
    setData(d => ({
      ...d,
      topics: d.topics.map(t =>
        t.id === topicId
          ? { ...t, tasks: t.tasks.filter(task => task.id !== taskId) }
          : t
      ),
    }))
  }

  const setTaskDate = (topicId, taskId, date) => {
    setData(d => ({
      ...d,
      topics: d.topics.map(t =>
        t.id === topicId
          ? { ...t, tasks: t.tasks.map(task => task.id === taskId ? { ...task, date } : task) }
          : t
      ),
    }))
  }

  const toggleAsap = (topicId, taskId) => {
    setData(d => ({
      ...d,
      topics: d.topics.map(t =>
        t.id === topicId
          ? { ...t, tasks: t.tasks.map(task => task.id === taskId ? { ...task, asap: !task.asap } : task) }
          : t
      ),
    }))
  }

  const setSavings = (field, value) => {
    setData(d => ({
      ...d,
      savings: { ...d.savings, [field]: value },
    }))
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-20 flex gap-12">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-12 text-gray-900">Tasks</h1>
          <div className="space-y-1">
            <AsapSection topics={data.topics} onToggleAsap={toggleAsap} onToggleTask={toggleTask} />
            {data.topics.map((topic, i) => (
              <TopicSection
                key={topic.id}
                topic={topic}
                isFirst={i === 0}
                onRenameTopic={renameTopic}
                onDeleteTopic={deleteTopic}
                onAddTask={addTask}
                onUpdateTask={updateTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onSetTaskDate={setTaskDate}
                onToggleAsap={toggleAsap}
              />
            ))}
            <AddTopicRow onAdd={addTopic} />
          </div>
        </div>
        <div className="w-64 flex-shrink-0">
          <div className="sticky top-20">
            <SavingsWidget
              saved={data.savings.saved}
              goal={data.savings.goal}
              onSetSavings={setSavings}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AsapSection({ topics, onToggleAsap, onToggleTask }) {
  const asapTasks = []
  topics.forEach(topic => {
    topic.tasks.forEach(task => {
      if (task.asap && !task.done) {
        asapTasks.push({ ...task, topicId: topic.id, topicName: topic.name })
      }
    })
  })

  if (asapTasks.length === 0) return null

  return (
    <div className="pb-10 mb-2 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.732-3l-7-12a2 2 0 00-3.464 0l-7 12A2 2 0 005 19z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">ASAP</h2>
      </div>
      <div className="ml-6">
        {asapTasks.map(task => (
          <div key={task.id} className="flex items-center gap-2 py-0.5 group/asap-task">
            <div className="w-6 flex-shrink-0" />
            <button
              onClick={() => onToggleTask(task.topicId, task.id)}
              className="w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center border-gray-300 hover:border-gray-400 transition-colors"
            />
            <span className="text-sm text-gray-700 flex-1">{task.text}</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{task.topicName}</span>
            <button
              onClick={() => onToggleAsap(task.topicId, task.id)}
              className="flex-shrink-0 text-gray-700 hover:text-gray-500 transition-colors"
              title="Remove from ASAP"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.732-3l-7-12a2 2 0 00-3.464 0l-7 12A2 2 0 005 19z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopicSection({ topic, isFirst, onRenameTopic, onDeleteTopic, onAddTask, onUpdateTask, onToggleTask, onDeleteTask, onSetTaskDate, onToggleAsap }) {
  const [addingTask, setAddingTask] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const titleRef = useRef(null)

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setAddingTask(true)
    }
  }

  const handleTitleBlur = (e) => {
    const val = e.target.innerText.trim()
    if (val) {
      onRenameTopic(topic.id, val)
    } else {
      if (titleRef.current) titleRef.current.innerText = topic.name
    }
  }

  return (
    <div className="group/topic pb-10" onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setConfirmDelete(false) }}>
      {/* Topic title row */}
      <div className="flex items-center gap-1 mt-6">
        <div className="w-6 flex-shrink-0 flex justify-center">
          {hovered && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-gray-300 hover:text-gray-500 text-sm leading-none"
              title="Delete topic"
            >
              x
            </button>
          )}
          {confirmDelete && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDeleteTopic(topic.id); setConfirmDelete(false) }}
                className="text-red-400 hover:text-red-600 text-xs font-medium leading-none"
              >
                Delete?
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-gray-400 hover:text-gray-600 text-xs leading-none"
              >
                No
              </button>
            </div>
          )}
        </div>
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleTitleKeyDown}
          onBlur={handleTitleBlur}
          className="text-lg font-semibold text-gray-900 outline-none flex-1 py-1 cursor-text"
        >
          {topic.name}
        </div>
      </div>

      {/* Tasks */}
      <div className="ml-7 mt-1">
        {topic.tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            topicId={topic.id}
            topicName={topic.name}
            onToggle={onToggleTask}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onSetDate={onSetTaskDate}
            onToggleAsap={onToggleAsap}
          />
        ))}
        {addingTask ? (
          <NewTaskInput
            topicId={topic.id}
            onAdd={onAddTask}
            onDone={() => setAddingTask(false)}
          />
        ) : (
          <button
            onClick={() => setAddingTask(true)}
            className="flex items-center gap-2 py-1 text-sm text-gray-300 hover:text-gray-500 transition-colors w-full text-left"
          >
            <span className="w-4 h-4 border border-gray-200 rounded inline-block" />
            Add a task
          </button>
        )}
      </div>
    </div>
  )
}

function TaskRow({ task, topicId, topicName, onToggle, onUpdate, onDelete, onSetDate, onToggleAsap }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
    if (e.key === 'Backspace' && e.target.innerText.trim() === '') {
      e.preventDefault()
      onDelete(topicId, task.id)
    }
  }

  const handleBlur = (e) => {
    const val = e.target.innerText.trim()
    if (val) {
      onUpdate(topicId, task.id, val)
    } else {
      onDelete(topicId, task.id)
    }
  }

  return (
    <div
      className="flex items-center gap-2 py-0.5 group/task"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-6 flex-shrink-0 flex justify-center">
        {hovered && (
          <button
            onClick={() => onDelete(topicId, task.id)}
            className="text-gray-300 hover:text-gray-500 text-xs leading-none"
            title="Delete task"
          >
            x
          </button>
        )}
      </div>
      <button
        onClick={() => onToggle(topicId, task.id)}
        className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
          task.done ? 'bg-gray-700 border-gray-700' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {task.done && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`text-sm outline-none flex-1 py-0.5 ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
      >
        {task.text}
      </div>
      <button
        onClick={() => onToggleAsap(topicId, task.id)}
        className={`flex-shrink-0 transition-colors ${task.asap ? 'text-gray-700' : 'text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100'}`}
        title="Mark as ASAP"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.732-3l-7-12a2 2 0 00-3.464 0l-7 12A2 2 0 005 19z" />
        </svg>
      </button>
      <div className="flex items-center gap-1 flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <input
          type="date"
          value={task.date || ''}
          onChange={e => onSetDate(topicId, task.id, e.target.value)}
          className={`text-xs text-gray-400 border-none bg-transparent outline-none cursor-pointer ${task.date ? 'text-gray-500' : 'opacity-0 group-hover:opacity-100'}`}
        />
      </div>
    </div>
  )
}

function NewTaskInput({ topicId, onAdd, onDone }) {
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const id = onAdd(topicId, value)
      if (id) {
        setValue('')
      }
    }
    if (e.key === 'Escape') {
      onDone()
    }
  }

  const handleBlur = () => {
    if (value.trim()) {
      onAdd(topicId, value)
    }
    onDone()
  }

  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-6 flex-shrink-0" />
      <span className="w-4 h-4 border border-gray-300 rounded inline-block flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type a task and press Enter"
        className="text-sm outline-none flex-1 py-0.5 bg-transparent text-gray-700 placeholder-gray-300"
      />
      <div className="w-44 flex-shrink-0" />
    </div>
  )
}

function AddTopicRow({ onAdd }) {
  const [active, setActive] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (active) inputRef.current?.focus()
  }, [active])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const id = onAdd(value)
      if (id) {
        setValue('')
        setActive(false)
      }
    }
    if (e.key === 'Escape') {
      setActive(false)
      setValue('')
    }
  }

  const handleBlur = () => {
    if (value.trim()) {
      onAdd(value)
    }
    setValue('')
    setActive(false)
  }

  if (!active) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setActive(true)}
          className="text-sm text-gray-300 hover:text-gray-500 transition-colors"
        >
          + Add a topic
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder="Type a topic name and press Enter"
        className="text-lg font-semibold text-gray-900 outline-none bg-transparent placeholder-gray-300 w-full"
      />
    </div>
  )
}

function SavingsWidget({ saved, goal, onSetSavings }) {
  const [adding, setAdding] = useState(false)
  const [contrib, setContrib] = useState('')
  const inputRef = useRef(null)

  const savedNum = parseFloat(saved) || 0
  const goalNum = parseFloat(goal) || 10000
  const pct = goalNum > 0 ? Math.min(savedNum / goalNum, 1) : 0

  const radius = 52
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  const submitContrib = () => {
    const val = parseFloat(contrib)
    if (val && val !== 0) {
      const newSaved = Math.max(0, savedNum + val)
      onSetSavings('saved', String(newSaved))
    }
    setContrib('')
    setAdding(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitContrib()
    }
    if (e.key === 'Escape') {
      setContrib('')
      setAdding(false)
    }
  }

  return (
    <div className="text-gray-700">
      <h2 className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wide">Savings</h2>

      {/* Donut chart */}
      <div className="relative w-36 h-36 mx-auto mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r={radius}
            fill="none" stroke="#f3f4f6" strokeWidth={stroke}
          />
          <circle
            cx="64" cy="64" r={radius}
            fill="none" stroke="#374151" strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => { if (!adding) setAdding(true) }}
          title="Click to add a contribution"
        >
          {adding ? (
            <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
              <span className="text-sm text-gray-400">$</span>
              <input
                ref={inputRef}
                type="number"
                value={contrib}
                onChange={e => setContrib(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={submitContrib}
                placeholder="0"
                className="w-16 text-center text-sm text-gray-700 bg-transparent border-b border-gray-300 outline-none pb-0.5"
              />
            </div>
          ) : (
            <>
              <span className="text-2xl font-semibold text-gray-800">
                {(pct * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400 mt-0.5">
                ${savedNum.toLocaleString()} / ${goalNum.toLocaleString()}
              </span>
              <span className="text-xs text-gray-300 mt-1 hover:text-gray-400 transition-colors">
                click to add
              </span>
            </>
          )}
        </div>
      </div>

    </div>
  )
}
