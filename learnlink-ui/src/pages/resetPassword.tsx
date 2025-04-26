import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';

// Define the ResetPassword functional component
const ResetPassword: React.FC = () => {
    return(
        <div className="resetPassword">
        <Logo />
        <form>
            <label>New Password</label>
            <input type="password"></input>

            <label>Confirm New Password</label>
            <input type="password"></input>

            <button type="submit"></button>

        </form>
        <CopyrightFooter />
        </div>
        
    );
}


// Export the ResetPassword component for use in other parts of the application
export default ResetPassword;