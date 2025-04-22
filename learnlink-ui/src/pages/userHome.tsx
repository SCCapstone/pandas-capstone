import '../index.css';
import Copyright from '../components/CopyrightFooter';
import WelcomeComponent from '../components/WelcomeComponent';
import Navbar from '../components/Navbar';



function userHome() {

    return (
        <div>
            <div className="userHome">

                <header>
                    <Navbar />
                </header>
                
                <div>
                    <div className="titleContainer">
                        <h1 className="well">Learn more about LearnLink!</h1>
                        <p className='briefEx'>The best way to find study groups!</p>
                    </div>
                </div>

                 <WelcomeComponent data-testid="welcome-component"/>


                <div>
                    <Copyright />
                </div>
            </div>
        </div>
    );
}

export default userHome;

