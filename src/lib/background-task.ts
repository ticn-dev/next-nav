type Task = {
  id: number
  task: Promise<unknown>
}

const taskPool = new Map<number, Task>()

function selectTaskId(): number {
  let randomId = Math.floor(Math.random() * 1000000)
  while (taskPool.has(randomId)) {
    randomId = Math.floor(Math.random() * 1000000)
  }
  return randomId
}

export function submitBgTask(asyncTask: () => Promise<unknown> | void) {
  const wrappedTask = async () => {
    try {
      return await asyncTask()
    } catch (error) {
      console.error('Task failed:', error)
      throw error
    }
  }
  const taskId = selectTaskId()
  const task = {
    id: taskId,
    task: wrappedTask(),
  }
  taskPool.set(taskId, task)
  task.task.finally(() => {
    console.debug('Task completed:', taskId)
    taskPool.delete(taskId)
  })
  return task
}
