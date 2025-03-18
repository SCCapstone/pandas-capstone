// src/pages/Network/types.ts

export interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    college: string;
    coursework: string[];
    profilePic: string;
  }
  
  export interface StudyGroup {
    id: number;
    name: string;
    description: string;
    profilePic?: string;
  }
  
  export interface Group {
    studyGroup: StudyGroup;
  }
  
  export enum SwipeStatus {
    Accepted = 'Accepted',
    Denied = 'Denied',
    Pending = 'Pending'
  }
  
  export interface SwipeRequest {
    id: number;
    userId: number;
    targetUserId: number | null;
    targetGroupId: number | null;
    message: string;
    createdAt: string;
    user: User;
    targetGroup: Group;
    direction: 'Yes' | 'No';
    targetUser?: User;
    status: SwipeStatus;
  }
  