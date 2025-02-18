import './NotificationDropdown.css';
import { useState } from 'react';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
}

const handleSelectNotif = () => {
    // Implement the notification selection logic here
};


const NotificationDropdown: React.FC = () => {
    const [notifs, setNotifs] = useState<User[]>([]);


    return (
        <div>
            {/* <button className="notif-dropbtn">Notifications</button> */}
            <ul className="notif-dropdown">
            {notifs ? <p  onClick={() => handleSelectNotif()}>
                                {"NOTIFICATION 1"}
                                
                            </p> : <p>No notifications</p>}

            </ul>
            {/* </div> */}
            </div>
    );
};
export default NotificationDropdown;

