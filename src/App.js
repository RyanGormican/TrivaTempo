import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

function shuffleArray(array) {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function App() {
  const [question, setQuestion] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [answerStreak, setAnswerStreak] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [timer,setTimer]=useState(15);

      const fetchQuestion = () => {
      fetch('https://the-trivia-api.com/v2/questions/')
        .then(response => response.json())
        .then(data => {
          setQuestion({
            ...data[0],
            answers: shuffleArray([...data[0].incorrectAnswers, data[0].correctAnswer]),
          });
        })
        .catch(error => console.error('Error fetching question:', error));
    };
  useEffect(() => {
    fetchQuestion();
  }, []);
   useEffect(() => {
  const interval = setInterval(() => {
  if (userAnswer === null)
  {
    setTimer(prevTimer => prevTimer - 1);
  }
  }, 1000);

  if (timer === 0 && userAnswer === null) {
    clearInterval(interval);
    setUserAnswer('show');

    setTimeout(() => {
      setIncorrectAnswers(incorrectAnswers+1);
      setUserAnswer(null);
      fetchQuestion();
      setTimer(15);
    }, 3000);
  }

  return () => clearInterval(interval);
}, [timer, userAnswer]);

  const handleAnswer = (Answer) => {
    if (userAnswer === null) {
      setUserAnswer(Answer);

      setTimeout(() => {
        if (Answer === question.correctAnswer) {
          setAnswerStreak(answerStreak + 1);
          setCorrectAnswers(correctAnswers + 1);
        } else {
          setAnswerStreak(0);
          setIncorrectAnswers(incorrectAnswers + 1);
        }
        fetchQuestion();
        setUserAnswer(null);
        setTimer(15);
      }, 3000);
    }
  };

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
        <div>
        {timer}
        </div>
        <div className="question-container">
          {question && (
            <>
              <h2>{question.question.text}</h2>
              <ul>
                {question.answers?.map(answer => (
                  <button
                    className={`answers ${
                      userAnswer !== null
                        ? answer === question.correctAnswer
                          ? 'correct'
                          : 'incorrect'
                        : ''
                    }`}
                    key={answer}
                    onClick={() => handleAnswer(answer)}
                  >
                    {answer}
                  </button>
                ))}
              </ul>
            </>
          )}
        </div>
        <span>
          <p> Correct Answers: {correctAnswers} </p>
          <p> Incorrect Answers: {incorrectAnswers} </p>
          <p> Answer Streak: {answerStreak} </p>
        </span>
      </header>
    </div>
  );
}

export default App;
