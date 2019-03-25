export interface IPublishProgress {
  /** Name of current publish task that is being executed */
  task: string
  /** Status message for the current task */
  status: string
  /** Indicates if the task has been completed */
  complete: boolean
  /** The number of steps for the current task that have been completed */
  completedSteps?: number
  /** The total number of steps to complete the current task */
  totalSteps?: number
}
