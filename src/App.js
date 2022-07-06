import {useState, useRef, useEffect} from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import '@material/react-layout-grid/dist/layout-grid.css';
import './App.css';

function App() {
  const [videoURL, setVideoURL] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [rawChats, setRawChats] = useState(localStorage.getItem('rawChats') || '');
  const [allChats, setAllChats] = useState([]);
  const [startTimeStr, setStartTimeStr] = useState(localStorage.getItem('startTime') || '06/01/2022 19:00:00');
  const [shouldScroll, setShouldScroll] = useState(false);
  const chatroomRef = useRef(null);
  const surveyUrl = 'https://forms.gle/Tm7gGJWEDQ9A8Nep6';

  const chats = allChats.filter(chat => chat[0] < currentTime).map(chat => chat[1]);

  useEffect(() => {
    if (shouldScroll) {
      chatroomRef.current.scrollTop = chatroomRef.current.scrollHeight;
    }
  }, [chats.length]);

  useEffect(() => {
    const startTime = new Date(startTimeStr);
    const dateStr = startTimeStr.split(' ')[0];
    const chats = rawChats.split(dateStr).slice(1).map((line, i) => {
      const chat = line.split(/\s+PM\s+來自\s+|\s+至所有人:\s+/);
      return [
        (new Date(dateStr + chat[0]) - startTime) / 1000,
        <p key={i}>
          <b>{chat[1]}</b>: {chat[2].split('\n').filter(l => l !== '').map((c, j) => <span key={j}>{c}<br /></span>)}
        </p>
      ]
    });
    setAllChats(chats);
  }, [startTimeStr, rawChats]);

  const updateTime = e => {
    setShouldScroll(chatroomRef.current.scrollTop + chatroomRef.current.clientHeight >= chatroomRef.current.scrollHeight);
    setCurrentTime(e.target.currentTime);
  };

  return (
    <Grid>
      <Row>
        <Cell columns={9}>
          <video src={videoURL} controls
            onTimeUpdate={updateTime}
            onSeeked={updateTime}
            width="100%"></video>
          <p>Choose Video: <input type="file" accept="video/*" onChange={(e) => {
            const URL = window.URL || window.webkitURL;
            const fileURL = URL.createObjectURL(e.target.files[0])
            setVideoURL(fileURL);
          }} /></p>
          <p>Choose chats file: <input type="file" accept=".txt" onChange={e => {
            const fr = new FileReader();
            fr.onload = () => {
              const raw = fr.result;
              localStorage.setItem('rawChats', raw);
              setRawChats(raw);
            }
            fr.readAsText(e.target.files[0]);
          }} /></p>
          <p>Video Start Time (MM/dd/yyyy HH:mm:ss): <input value={startTimeStr} onChange={e => {
            localStorage.setItem('startTime', e.target.value);
            setStartTimeStr(e.target.value);
          }} /></p>
          <p>Any feedback: : <a href={surveyUrl} target="_blank">{surveyUrl}</a></p>
        </Cell>
        <Cell columns={3}>
          <div id="chatroom" ref={chatroomRef}>
            {chats}
          </div>
        </Cell>
      </Row>
    </Grid>
  );
}

export default App;
