import '../App.css';
import { WorkHistoryMap } from '../components/WorkHistoryMap/WorkHistoryMap';
import './History.css';

export const History = () => {
  return (
    <div className="App history-page history-route" style={{ minHeight: '100%' }}>
      <div className="history-page-shell">
        <WorkHistoryMap />
      </div>
    </div>
  );
};
