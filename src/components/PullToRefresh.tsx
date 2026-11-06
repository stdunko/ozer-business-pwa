import { useRef, useState, type ReactNode } from "react";

type PullToRefreshProps = {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
};

const PullToRefresh = ({ onRefresh, children, className = "" }: PullToRefreshProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (ref.current && ref.current.scrollTop <= 0) {
      startY.current = event.touches[0].clientY;
    } else {
      startY.current = 0;
    }
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!startY.current || refreshing) {
      return;
    }
    const dy = event.touches[0].clientY - startY.current;
    if (dy > 0 && (ref.current?.scrollTop || 0) <= 0) {
      setPull(Math.min(dy, 88));
    }
  };

  const onTouchEnd = async () => {
    if (pull > 56 && !refreshing) {
      setRefreshing(true);
      setPull(56);
      await onRefresh();
      setRefreshing(false);
    }
    setPull(0);
    startY.current = 0;
  };

  return (
    <div
      ref={ref}
      className={`scroll ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`ptr-indicator ${pull > 24 || refreshing ? "visible" : ""}`} style={{ height: pull || (refreshing ? 56 : 0) }}>
        {pull > 32 || refreshing ? <span className="spinner" /> : null}
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;
