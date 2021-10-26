import { Subjects } from '../subjects';

export interface UserCreatedEvent {
    subject: Subjects.UserCreated;
    data: {
        id: string
        email: string
        firstname: string
        lastname: string
        mobile?: string
        isBlocked: boolean
        isPremium: boolean
        profileImage?: string
        notificationId?: string
        deviceId?: string
        version?: number
    };
}