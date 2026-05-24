import '../App.css';
import { WorkHistoryMap } from '../components/WorkHistoryMap/WorkHistoryMap';
import './History.css';

export const History = () => {
  return (
    <div className="App history-page history-route" style={{ height: '100vh', overflow: 'hidden' }}>
      <div className="history-page-shell">
        <WorkHistoryMap />
      </div>
    </div>
  );
};
