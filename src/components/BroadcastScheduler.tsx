import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { BroadcastProgram } from '../types';
import { formatBroadcastTime, programEnd, toISTInput } from '../utils/schedule';

const field = 'w-full bg-slate-950 border border-blue-900/60 rounded-lg p-2 text-xs text-white';
export const BroadcastScheduler: React.FC = () => {
  const { programs, saveProgram, deleteProgram, liveStreams, broadcastSettings, updateBroadcastSettings, scheduleState } = useNews();
  const fresh = (): BroadcastProgram => ({ id: crypto.randomUUID(), title: '', anchor: '', category: 'News',
    startAt: new Date(Math.ceil(Date.now() / 1800000) * 1800000).toISOString(), durationMinutes: 30, streamId: liveStreams[0]?.id || '' });
  const [draft, setDraft] = useState(fresh);
  const [message, setMessage] = useState('');
  const set = (key: keyof BroadcastProgram, value: string | number) => setDraft((previous) => ({ ...previous, [key]: value }));
  const sources = liveStreams.filter((source) => source.streamType !== 'webrtc' && !source.streamUrl.startsWith('blob:'));
  const sourceOptions = sources.map((source) => <option key={source.id} value={source.id}>{source.channelName} — {source.title}</option>);
  return <section className="space-y-5 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/50 pb-4">
      <div><h3 className="font-black">48-hour broadcast scheduler</h3><p className="text-xs text-slate-400 mt-1">All times are IST. Scheduled sources take priority while automation is enabled.</p></div>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!broadcastSettings.schedulerEnabled} onChange={(event) => updateBroadcastSettings({ schedulerEnabled: event.target.checked })} />Enable automation</label>
    </div>
    <label className="block text-xs text-slate-300">Fallback feed for schedule gaps
      <select className={field} value={broadcastSettings.fallbackStreamId || ''} onChange={(event) => updateBroadcastSettings({ fallbackStreamId: event.target.value })}><option value="">Use manually selected feed</option>{sourceOptions}</select>
    </label>
    <div className="text-xs text-slate-300">Now: <strong>{scheduleState.current?.title || 'Manual / fallback feed'}</strong> · Next: <strong>{scheduleState.next?.title || 'No program scheduled'}</strong></div>
    <form className="grid sm:grid-cols-2 gap-3" onSubmit={(event) => { event.preventDefault(); const error = saveProgram(draft); setMessage(error || 'Program saved.'); if (!error) setDraft(fresh()); }}>
      <label className="text-xs">Program title<input required className={field} value={draft.title} onChange={(event) => set('title', event.target.value)} /></label>
      <label className="text-xs">Anchor<input className={field} value={draft.anchor} onChange={(event) => set('anchor', event.target.value)} /></label>
      <label className="text-xs">Start time (IST)<input required type="datetime-local" className={field} value={toISTInput(Date.parse(draft.startAt))} onChange={(event) => { if (event.target.value) set('startAt', new Date(`${event.target.value}+05:30`).toISOString()); }} /></label>
      <label className="text-xs">Duration<select className={field} value={draft.durationMinutes} onChange={(event) => set('durationMinutes', Number(event.target.value))}><option value={30}>30 minutes</option><option value={60}>60 minutes</option></select></label>
      <label className="text-xs">Category<input className={field} value={draft.category} onChange={(event) => set('category', event.target.value)} /></label>
      <label className="text-xs">Video source<select required className={field} value={draft.streamId} onChange={(event) => set('streamId', event.target.value)}>{sourceOptions}</select></label>
      <label className="text-xs">Program fallback<select className={field} value={draft.fallbackStreamId || ''} onChange={(event) => set('fallbackStreamId', event.target.value)}><option value="">Use global fallback</option>{sourceOptions}</select></label>
      <div className="flex items-end gap-2"><button className="bg-blue-600 rounded-lg px-4 py-2 text-xs font-bold">Save program</button><button type="button" onClick={() => setDraft(fresh())} className="text-xs px-3 py-2">Clear editor</button></div>
    </form>
    {message && <p role="status" className="text-xs text-amber-300">{message}</p>}
    {!programs.some((program) => programEnd(program) > Date.now()) && <button type="button" className="border border-blue-700 rounded-lg px-3 py-2 text-xs" onClick={() => {
      const start = Math.ceil(Date.now() / 1800000) * 1800000;
      const titles = ['Morning Bhakthi', 'Daily Crime Watch', 'Health Hour', 'Prime Time Debate'];
      let cursor = start;
      let count = 0;
      const deadline = Date.now() + 48 * 3600000;
      while (cursor + 1800000 <= deadline && sources.length) {
        const durationMinutes = cursor + 3600000 <= deadline ? 60 : 30;
        const error = saveProgram({ ...fresh(), id: crypto.randomUUID(), title: titles[count % titles.length], durationMinutes, startAt: new Date(cursor).toISOString(), streamId: sources[0].id });
        if (error) { setMessage(error); return; }
        count++;
        cursor += durationMinutes * 60000;
      }
      setMessage(`${count} programs created for the next 48 hours. Review titles, sources, and anchors before enabling automation.`);
    }}>Generate a 48-hour grid</button>}
    <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="text-slate-400"><tr>{['IST slot', 'Program / anchor', 'Source', 'Actions'].map((title) => <th key={title} className="py-2 pr-3">{title}</th>)}</tr></thead><tbody>
      {[...programs].sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt)).map((program) => <tr key={program.id} className={`border-t border-blue-900/40 ${program.id === scheduleState.current?.id ? 'bg-blue-950/70' : ''}`}>
        <td className="py-3 pr-3 whitespace-nowrap">{formatBroadcastTime(program.startAt)}<br />{program.durationMinutes} min</td><td className="pr-3">{program.title}<br /><span className="text-slate-400">{program.anchor || 'Unassigned'} · {program.category}</span></td><td className="pr-3">{liveStreams.find((source) => source.id === program.streamId)?.channelName || 'Source removed; fallback applies'}</td><td className="whitespace-nowrap"><button className="text-blue-300 mr-3" onClick={() => setDraft(program)}>Edit</button><button className="text-red-300" onClick={() => deleteProgram(program.id)}>Delete</button></td>
      </tr>)}
    </tbody></table></div>
  </section>;
};

export const BroadcastScheduleRail: React.FC = () => {
  const { scheduleState, broadcastSettings } = useNews();
  return <div className="space-y-2"><h4 className="text-xs font-bold text-amber-300">48-hour schedule · IST {broadcastSettings.schedulerEnabled ? '· AUTOMATED' : '· MANUAL'}</h4>
    {!scheduleState.upcoming.length && <p className="text-xs text-slate-400">No programs scheduled. The selected feed continues playing.</p>}
    {scheduleState.upcoming.map((program) => <div key={program.id} className={`p-3 border-b border-blue-900/50 text-xs ${program.id === scheduleState.current?.id ? 'bg-blue-950/70' : ''}`}><span className="text-slate-400">{formatBroadcastTime(program.startAt)} · {program.durationMinutes} min</span><div className="font-bold mt-1">{program.title} {program.id === scheduleState.current?.id && broadcastSettings.schedulerEnabled && <span className="text-red-400">· NOW</span>}</div><div className="text-slate-400">{program.anchor} · {program.category}</div></div>)}
  </div>;
};
