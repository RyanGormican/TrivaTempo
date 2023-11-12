import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
function App() {
const [question, setQuestion] = useState(null);
const [correctAnswer, setcorrectAnswer] = useState(null);
  useEffect(() => {
    fetch('https://the-trivia-api.com/v2/questions/')
      .then(response => response.json())
      .then(data => setQuestion(data[0]))
      .catch(error => console.error('Error fetching question:', error));
      }, []); 
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
                <div className="question-container">
          {question && (
            <>
              <h2>{question.question.text}</h2>
              <ul>
                {[...question.incorrectAnswers, question.correctAnswer].map(answer => (
                  <button class="answers" key={answer}>{answer}</button>
                ))}
              </ul>
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
