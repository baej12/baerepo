import '../App.css';
import { WorkHistoryMap } from '../components/WorkHistoryMap/WorkHistoryMap';
import './History.css';

export const History = () => {
  return (
    <div className="history-page history-route">
      <div className="history-page-shell">
        <WorkHistoryMap />
      </div>
    </div>
  );
};
