import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect,useRef  } from 'react';
import { Icon } from '@iconify/react';
import Button from '@mui/material/Button';

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
  const [timer, setTimer] = useState(15);
  const [bestAnswerStreak, setBestAnswerStreak] = useState(0);
  const [questionTags, setQuestionTags] = useState([]);
  const [tagStats, setTagStats] = useState({});
  const [view, setView] = useState('basic');
  const [statsView, setStatsView] = useState('total');
  const fetchingQuestion = useRef(false);
   const fetchQuestion = () => {
    if (!fetchingQuestion.current) {
      fetchingQuestion.current = true;

      fetch('https://the-trivia-api.com/v2/questions/')
        .then(response => response.json())
        .then(data => {
          setQuestion({
            ...data[0],
            answers: shuffleArray([...data[0].incorrectAnswers, data[0].correctAnswer]),
          });
        })
        .catch(error => console.error('Error fetching question:', error))
        .finally(() => {
          fetchingQuestion.current = false;
        });
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {

    if (question) {
      setQuestionTags(prevTags => [...prevTags, ...question.tags]);
    }
  }, [question]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (userAnswer === null) {
        setTimer(prevTimer => prevTimer - 1);
      }
    }, 1000);

    if (timer === 0 && userAnswer === null) {
      clearInterval(interval);
      setUserAnswer('show');

      setTimeout(() => {
        setIncorrectAnswers(incorrectAnswers + 1);
        question.tags.forEach(tag => {
          setTagStats(prevStats => {
            const newStats = { ...prevStats };
            if (newStats[tag]) {
              newStats[tag].total += 1;
            } else {
              newStats[tag] = { total: 1, correct: 0 };
            }
            return newStats;
          });
        });
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
      question.tags.forEach(tag => {
        setTagStats(prevStats => {
          const newStats = { ...prevStats };
          if (newStats[tag]) {
            console.log(tag);
            newStats[tag] = prevState => ({
              total: prevState.total + 1,
              correct: Answer === question.correctAnswer ? prevState.correct + 1 : prevState.correct,
            });
          } else {
            newStats[tag] = {
              total: 1,
              correct: Answer === question.correctAnswer ? 1 : 0,
            };
            console.log(tag);
          }
          return newStats;
        });
      });

      if (Answer === question.correctAnswer) {
        setAnswerStreak(answerStreak + 1);
        setCorrectAnswers(correctAnswers + 1);
        if (answerStreak + 1 > bestAnswerStreak) {
          setBestAnswerStreak(answerStreak + 1);
        }
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
        <div className="timer">
          {timer}
        </div>
        <div className="question-container">
          {question && (
            <>
              <h2>{question.question.text}</h2>
              <h4>{question.tags.join(', ')}</h4>
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
        <div className="buttons">
          <Button style={{ color: 'white', fontFamily: 'Lato', border: '1px solid white', }} onClick={() => setView('basic')}> Answer Stats </Button>
          <Button style={{ color: 'white', fontFamily: 'Lato', border: '1px solid white', }} onClick={() => setView('stats')}> Type Stats </Button>
        </div>
        {view === 'basic' && (
          <span className="stats">
            <p> Correct Answers: {correctAnswers} </p>
            <p> Incorrect Answers: {incorrectAnswers} </p>
            <p> Current Answer Streak: {answerStreak} </p>
            <p> Best Answer Streak: {bestAnswerStreak} </p>
          </span>
        )}
        {view === 'stats' && (
          <div>
            <div className="buttons2">
              <Button style={{ color: 'white', fontFamily: 'Lato', border: '1px solid white', }} onClick={() => setStatsView('total')}> Total Stats </Button>
             
            </div>
            {statsView === 'total' && (
              <div>
                {questionTags.length > 0 && (
                  <div className="stats">
                    {Array.from(new Set(questionTags))
                      .sort((a, b) => questionTags.filter(t => t === b).length - questionTags.filter(t => t === a).length)
                      .map(tag => (
                        <p key={tag}>{`${tag}: ${questionTags.filter(t => t === tag).length}`}</p>
                      ))}
                  </div>
                )}
              </div>
            )}
 {statsView === 'percentage' && (
        <div className="stats">
         
          {Object.entries(tagStats)
            .map(([tag, stats]) => (
              <p key={tag}>
                {`${tag}: ${(((stats.correct )/ ((stats.total))) * 100).toFixed(2)}% (Correct: ${stats.correct}, Incorrect: ${stats.total - stats.correct}, Total: ${stats.total})`}
              </p>
            ))
            .sort((a, b) => b.percentage - a.percentage)}
        </div>
      )}

          </div>
        )}
      </header>
    </div>
  );
}

export default App;
