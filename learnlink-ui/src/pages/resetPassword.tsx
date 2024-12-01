import Logo from '../components/Logo';
import CopyrightFooter from '../components/CopyrightFooter';

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

export default ResetPassword;