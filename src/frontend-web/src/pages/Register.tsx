import RegisterForm from '../components/RegisterForm';

import "./Login.css"

const Register = () => {

  return (
    <div className='login-outer-div'>
      <div className='main-div-login'>
          <div className='wrapper-div'>
              <h1>Registracija</h1>
              <RegisterForm />
          </div>
      </div>
    </div>
  );
};

export default Register;
