import LoginForm from '../components/LoginForm';

import "./Login.css";


const Login = () => {

  return (
    <div className='login-outer-div'>
      <div className='main-div-login'>
        <div className='wrapper-div'>
          <h1>Prijava</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
