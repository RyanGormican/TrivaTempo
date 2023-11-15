import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect,useRef  } from 'react';
import { Icon } from '@iconify/react';
import Button from '@mui/material/Button';
import GoogleButton from 'react-google-button';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut  } from 'firebase/auth';
import { auth, database, storage } from './firebaseConfig';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
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
  const user = auth.currentUser;
  const [username, setUsername] = useState('');
  let googleProvider = new GoogleAuthProvider();

  const signUp = () => {
    signInWithPopup(auth, googleProvider);
  };
   const handleLogout = () => {
    signOut(auth);
  };

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
  const fetchData = async () => {
    try {
      if (user) {
        const userDocRef = doc(database, 'user', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBestAnswerStreak(userData.bestAnswerStreak || 0);
          setCorrectAnswers(userData.correctAnswers || 0);
          setIncorrectAnswers(userData.incorrectAnswers || 0);
          setUsername(userData.username || '');
          setTagStats(userData.tagStats || {});
          console.log(tagStats);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  fetchQuestion(); 
  fetchData(); 
}, [user]);


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
       updateUserData();
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

  const updateUserData = async ( Answer ) => {
    try {
      if (user) {
        const userDocRef = doc(database, 'user', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedTagStats = { ...userData.tagStats };

          question.tags.forEach(tag => {
            updatedTagStats[tag] = updatedTagStats[tag] || { total: 0, correct: 0 };
            updatedTagStats[tag].total += 1;
            if (Answer === question.correctAnswer) {
              updatedTagStats[tag].correct += 1;
            }
          });
          await updateDoc(userDocRef, {
            totalAnswered: userData.totalAnswered + 1,
            correctAnswers: userData.correctAnswers + (Answer === question.correctAnswer ? 1 : 0),
            incorrectAnswers: userData.incorrectAnswers + (Answer !== question.correctAnswer ? 1 : 0),
            bestAnswerStreak: Math.max(userData.bestAnswerStreak, answerStreak),
            tagStats: updatedTagStats,
          });
        } else {
          const newTagStats = {};
          question.tags.forEach(tag => {
            newTagStats[tag] = { total: 1, correct: Answer === question.correctAnswer ? 1 : 0 };
          });

          await setDoc(userDocRef, {
            totalAnswered: 1,
            correctAnswers: Answer === question.correctAnswer ? 1 : 0,
            incorrectAnswers: Answer !== question.correctAnswer ? 1 : 0,
            bestAnswerStreak: answerStreak,
            tagStats: newTagStats,
          });
        }
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const updateUsername = async () => {
    try {
      if (user) {
        const userDocRef = doc(database, 'user', user.uid);
        await updateDoc(userDocRef, { username });
      }
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

const handleAnswer = (Answer) => {
  if (userAnswer === null) {
    setUserAnswer(Answer);
      updateUserData(Answer);
   setTimeout(() => {
  question.tags.forEach(tag => {
    setTagStats(prevStats => {
      const newStats = { ...prevStats };
      if (newStats[tag]) {
        newStats[tag] = prevState => ({
          total: prevState.total + 1,
          correct: Answer === question.correctAnswer ? prevState.correct + 1 : prevState.correct,
        });
      } else {
        newStats[tag] = {
          total: 1,
          correct: Answer === question.correctAnswer ? 1 : 0,
        };
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
          <Button style={{ color: 'white', fontFamily: 'Lato', border: '1px solid white', }} onClick={() => setView('account')}> Account </Button>
          <Button style={{ color: 'white', fontFamily: 'Lato', border: '1px solid white', }} onClick={() => setView('leaderboard')}> Leaderboard </Button>
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
  <div className="stats">
    {Object.entries(tagStats)
      .sort(([, a], [, b]) => b.total - a.total) 
      .map(([tag, stats]) => (
        <p key={tag}>{`${tag}: ${stats.total}`}</p>
      ))}
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

            {view === 'account' && (
            <div>
            <div className="center">
            {!user && (
            <div>
            Sign in to save your stats!
            <GoogleButton onClick={signUp} />
            </div>
            )}
            {user  && (
            <div className="center">
            <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <Button
                      style={{ color: 'white', fontFamily: 'Lato', border: '1px solid white' }}
                      onClick={updateUsername}
                    >
                      Update Username
                    </Button>
             <div className="icon-logout" onClick={handleLogout}>
                <Icon icon="material-symbols:logout" height="60" />
            </div>
            </div>
            )}
            </div>
            </div>
            )}


             {view === 'leaderboard' && (
            <div>
            <div className="center">
            Coming Soon!
            </div>
            </div>
            )}
      </header>
    </div>
  );
}

export default App;
