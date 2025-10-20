import React from 'react';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Timeframe = {
  id: string;
  naziv: string;
  startDate: Date | null;
  startTime: Date | null;
  endDate: Date | null;
  endTime: Date | null;
};

type Props = {
  timeframes: Timeframe[];
  setTimeframes: React.Dispatch<React.SetStateAction<Timeframe[]>>;
};

const SortableItem: React.FC<{
  tf: Timeframe;
  updateTimeframe: (id: string, field: keyof Omit<Timeframe, 'id'>, value: Date | null) => void;
  removeTimeframe: (id: string) => void;
}> = ({ tf, updateTimeframe, removeTimeframe }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '2.5px 10px',
  };

  return (<>
    <div ref={setNodeRef} style={style}>
      <h4 {...attributes} {...listeners} style={{ cursor: 'grab', marginBottom: '0.5rem' }}>
        {tf.naziv}
      </h4>
    <div className="novi-dogadjaj-kalendar">
      
        <div className="novi-dogadjaj-kalendar-left">
        <label style={{marginLeft: '26.5px'}}>Početak:</label>
        <div className="novi-dogadjaj-kalendar-div">
          <Calendar
            locale="custom"
            placeholder="Datum"
            value={tf.startDate}
            onChange={(e) => updateTimeframe(tf.id, 'startDate', e.value as Date | null)}
            showIcon
          />
          <Calendar
            locale="custom"
            placeholder="Vreme"
            className="pi-pi"
            value={tf.startTime}
            onChange={(e) => updateTimeframe(tf.id, 'startTime', e.value as Date | null)}
            timeOnly
            showIcon
            icon={() => <i className="pi pi-clock" />}
          />
        </div>
      </div>

      <div className="novi-dogadjaj-kalendar-right">
        <label>Kraj:</label>
        <div className="novi-dogadjaj-kalendar-div">
          <Calendar
            locale="custom"
            placeholder="Datum"
            value={tf.endDate}
            onChange={(e) => updateTimeframe(tf.id, 'endDate', e.value as Date | null)}
            showIcon
          />
          <Calendar
            locale="custom"
            placeholder="Vreme"
            className="pi-pi"
            value={tf.endTime}
            onChange={(e) => updateTimeframe(tf.id, 'endTime', e.value as Date | null)}
            timeOnly
            showIcon
            icon={() => <i className="pi pi-clock" />}
          />
          <div className='time-frame-options'>
              <div {...attributes} {...listeners} style={{ cursor: 'grab' }}>
              <i className="pi pi-bars" />
            </div>
            <Button
              icon="pi pi-trash"
              severity="danger"
              className="p-button-text"
              onClick={() => removeTimeframe(tf.id)}
              style={{ alignSelf: 'flex-start', marginLeft: '1rem' }}
            />
          </div>
        </div>
      </div>
    </div>
    {/* <hr /> */}
    </div>
  </>);
};

const TimeframeList: React.FC<Props> = ({ timeframes, setTimeframes }) => {
  const updateTimeframe = (
    id: string,
    field: keyof Omit<Timeframe, 'id'>,
    value: Date | null
  ) => {
    setTimeframes(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const removeTimeframe = (id: string) => {
    setTimeframes(prev => prev.filter(t => t.id !== id));
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = timeframes.findIndex(t => t.id === active.id);
      const newIndex = timeframes.findIndex(t => t.id === over.id);
      const newOrder = arrayMove(timeframes, oldIndex, newIndex);
      setTimeframes(newOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={timeframes.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {timeframes.map(tf => (
          <SortableItem
            key={tf.id}
            tf={tf}
            updateTimeframe={updateTimeframe}
            removeTimeframe={removeTimeframe}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default TimeframeList;
