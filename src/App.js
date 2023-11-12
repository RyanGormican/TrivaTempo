import logo from './logo.svg';
import './App.css';
import { Icon } from '@iconify/react';
function App() {
  return (
    <div className="App">
      <header className="App-header">
       <div className="links">
        <a href="https://www.linkedin.com/in/ryangormican/">
          <Icon icon="mdi:linkedin" color="#0e76a8" width="60" />
        </a>
        <a href="https://github.com/RyanGormican/TrivaTempo">
          <Icon icon="mdi:github" color="#e8eaea" width="60" />
        </a>
        <a href="https://ryangormicanportfoliohub.vercel.app/">
          <Icon icon="teenyicons:computer-outline" color="#199c35" width="60" />
        </a>
      </div>
        <div className="title">
        TriviaTempo
        </div>
      </header>
    </div>
  );
}

export default App;
