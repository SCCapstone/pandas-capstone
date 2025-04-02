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
    users: User[];
    subject?: string;
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
    updatedAt: Date;
  }
  
  export interface Match {
    id: number;
    user1Id:number;
    user2Id:number;
    studyGroupId?:number;
    user1: User;
    user2: User;
    studyGroup?: StudyGroup;
    isStudyGroupMatch: boolean;
  }