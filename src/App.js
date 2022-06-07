import {useState, useRef, useEffect} from 'react';
import {Cell, Grid, Row} from '@material/react-layout-grid';
import '@material/react-layout-grid/dist/layout-grid.css';
import './App.css';

function App() {
  const [videoURL, setVideoURL] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [rawChats, setRawChats] = useState('');
  const [allChats, setAllChats] = useState([]);
  const [startTimeStr, setStartTimeStr] = useState('06/01/2022 18:49:07');
  const [shouldScroll, setShouldScroll] = useState(false);
  const chatroomRef = useRef(null);

  const chats = allChats.filter(chat => chat[0] < currentTime).map(chat => chat[1]);

  useEffect(() => {
    if (shouldScroll) {
      chatroomRef.current.scrollTop = chatroomRef.current.scrollHeight;
    }
  }, [chats.length]);

  useEffect(() => {
    const startTime = new Date(startTimeStr);
    const dateStr = startTimeStr.split(' ')[0];
    const chats = rawChats.split(dateStr).slice(1).map(line => {
      const chat = line.split(/\ PM\ 來自\ |\ 至所有人:\ /);
      return [
        (new Date(dateStr + chat[0]) - startTime) / 1000,
        <p>
          <b>{chat[1]}</b>: {chat[2].split('\n').filter(l => l !== '').map(c => <span>{c}<br /></span>)}
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
        Choose Video: <input type="file" accept="video/*" onChange={(e) => {
            const URL = window.URL || window.webkitURL;
            const fileURL = URL.createObjectURL(e.target.files[0])
            setVideoURL(fileURL);
          }} />
          <video src={videoURL} controls
            onTimeUpdate={updateTime}
            onSeeked={updateTime}
            width="100%"></video>
        </Cell>
        <Cell columns={3}>
          <p>Choose chats file: <input type="file" onChange={e => {
            const fr = new FileReader();
            fr.onload = () => {
              setRawChats(fr.result);
            }
            fr.readAsText(e.target.files[0]);
          }} /></p>
          <p>Video Start Time: <input value={startTimeStr} onChange={e => setStartTimeStr(e.target.value)} /></p>
          <div id="chatroom" ref={chatroomRef}>
            {chats}
          </div>
        </Cell>
      </Row>
    </Grid>
  );
}

export default App;
