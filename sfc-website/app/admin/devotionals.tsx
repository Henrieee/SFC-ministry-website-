"use client";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Devotional = {
  id: string;
  title: string;
  passage: string;
  reading: string;
  lesson: string;
  speaker: string;
  used: boolean;
};

const DEFAULT_DEVOTIONAL = {
  title: "",
  passage: "",
  reading: "",
  lesson: "",
  speaker: "",
  used: false,
};

const TOPIC_SUGGESTIONS = [
  {
    title: "Walking in Faith, Not Sight",
    passage: "2 Corinthians 5:7",
    reading: "For we walk by faith, not by sight.",
    lessonPrompt: "Speak on trusting God's plan even when the outcome isn't visible yet — how faith carries us through uncertainty.",
  },
  {
    title: "The Power of Community",
    passage: "Ecclesiastes 4:9-10",
    reading: "Two are better than one; because they have a good reward for their labour. For if they fall, the one will lift up his fellow: but woe to him that is alone when he falleth; for he hath not another to help him up.",
    lessonPrompt: "Speak on why fellowship and belonging matter — how the church family supports each other through life's ups and downs.",
  },
  {
    title: "Forgiveness That Frees Us",
    passage: "Colossians 3:13",
    reading: "Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.",
    lessonPrompt: "Speak on letting go of grudges and extending grace to others the way Christ extended grace to us.",
  },
  {
    title: "Gratitude in Every Season",
    passage: "1 Thessalonians 5:16-18",
    reading: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
    lessonPrompt: "Speak on cultivating a thankful heart regardless of circumstance — gratitude as a spiritual discipline.",
  },
  {
    title: "Renewed Strength",
    passage: "Isaiah 40:31",
    reading: "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    lessonPrompt: "Speak on finding strength in waiting on God, especially during seasons of exhaustion or discouragement.",
  },
  {
    title: "Living Generously",
    passage: "2 Corinthians 9:7",
    reading: "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.",
    lessonPrompt: "Speak on generosity — of time, resources, and love — as an overflow of a grateful heart.",
  },
  {
    title: "Peace That Surpasses Understanding",
    passage: "Philippians 4:6-7",
    reading: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
    lessonPrompt: "Speak on releasing anxiety through prayer and trusting God with worries and uncertainty.",
  },
  {
    title: "Called to Serve",
    passage: "Galatians 5:13",
    reading: "For, brethren, ye have been called unto liberty; only use not liberty for an occasion to the flesh, but by love serve one another.",
    lessonPrompt: "Speak on using our freedom in Christ not for self, but to serve and love others well.",
  },
  {
    title: "New Mercies Every Morning",
    passage: "Lamentations 3:22-23",
    reading: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
    lessonPrompt: "Speak on God's faithfulness and how each new day is an opportunity for a fresh start in Him.",
  },
  {
    title: "Standing Firm Under Pressure",
    passage: "James 1:2-4",
    reading: "My brethren, count it all joy when ye fall into divers temptations; knowing this, that the trying of your faith worketh patience. But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.",
    lessonPrompt: "Speak on finding purpose and growth in trials, and how perseverance shapes Christian character.",
  },
  {
    title: "The Good Shepherd",
    passage: "John 10:11",
    reading: "I am the good shepherd: the good shepherd giveth his life for the sheep.",
    lessonPrompt: "Speak on Christ's sacrificial love and care for His people, and what it means to follow the Shepherd's voice.",
  },
  {
    title: "Anchored Hope",
    passage: "Hebrews 6:19",
    reading: "Which hope we have as an anchor of the soul, both sure and stedfast.",
    lessonPrompt: "Speak on hope in Christ as something stable to hold onto amid life's storms.",
  },
  {
    title: "Love One Another",
    passage: "John 13:34-35",
    reading: "A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another. By this shall all men know that ye are my disciples, if ye have love one to another.",
    lessonPrompt: "Speak on love as the defining mark of a Christian community, and practical ways to show it.",
  },
  {
    title: "Wisdom for the Asking",
    passage: "James 1:5",
    reading: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
    lessonPrompt: "Speak on seeking God's wisdom for daily decisions, and trusting Him to provide direction.",
  },
  {
    title: "Fearfully and Wonderfully Made",
    passage: "Psalm 139:14",
    reading: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.",
    lessonPrompt: "Speak on identity and worth found in being made in God's image, not in comparison to others.",
  },
  {
    title: "Casting Our Cares",
    passage: "1 Peter 5:7",
    reading: "Casting all your care upon him; for he careth for you.",
    lessonPrompt: "Speak on surrendering worry and burdens to God, trusting His care for the details of our lives.",
  },
  {
    title: "The Armor of God",
    passage: "Ephesians 6:11",
    reading: "Put on the whole armour of God, that ye may be able to stand against the wiles of the devil.",
    lessonPrompt: "Speak on spiritual preparedness and standing firm against temptation and discouragement.",
  },
  {
    title: "A Time for Everything",
    passage: "Ecclesiastes 3:1",
    reading: "To every thing there is a season, and a time to every purpose under the heaven.",
    lessonPrompt: "Speak on trusting God's timing in seasons of waiting, change, or transition.",
  },
  {
    title: "Rooted and Grounded in Love",
    passage: "Ephesians 3:17-18",
    reading: "That ye, being rooted and grounded in love, may be able to comprehend with all saints what is the breadth, and length, and depth, and height.",
    lessonPrompt: "Speak on building a life whose foundation is Christ's love rather than circumstances.",
  },
  {
    title: "Faith as Small as a Seed",
    passage: "Matthew 17:20",
    reading: "If ye have faith as a grain of mustard seed, ye shall say unto this mountain, Remove hence to yonder place; and it shall remove; and nothing shall be impossible unto you.",
    lessonPrompt: "Speak on how even small faith, rightly placed in God, can accomplish great things.",
  },
  {
    title: "The Lord Is My Shepherd",
    passage: "Psalm 23:1",
    reading: "The LORD is my shepherd; I shall not want.",
    lessonPrompt: "Speak on contentment and provision found in trusting God to lead and provide.",
  },
  {
    title: "Be Still and Know",
    passage: "Psalm 46:10",
    reading: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",
    lessonPrompt: "Speak on quieting our hearts before God amid a noisy, busy world.",
  },
  {
    title: "Guarding the Heart",
    passage: "Proverbs 4:23",
    reading: "Keep thy heart with all diligence; for out of it are the issues of life.",
    lessonPrompt: "Speak on being intentional about what we allow to shape our hearts and minds.",
  },
  {
    title: "Iron Sharpens Iron",
    passage: "Proverbs 27:17",
    reading: "Iron sharpeneth iron; so a man sharpeneth the countenance of his friend.",
    lessonPrompt: "Speak on the value of godly friendships that challenge and build us up.",
  },
  {
    title: "Freedom in Christ",
    passage: "John 8:36",
    reading: "If the Son therefore shall make you free, ye shall be free indeed.",
    lessonPrompt: "Speak on true freedom found in Christ — from sin, shame, and striving.",
  },
  {
    title: "A Living Sacrifice",
    passage: "Romans 12:1",
    reading: "I beseech you therefore, brethren, by the mercies of God, that ye present your bodies a living sacrifice, holy, acceptable unto God, which is your reasonable service.",
    lessonPrompt: "Speak on daily surrender and what it looks like to offer our whole lives to God.",
  },
  {
    title: "The Prodigal's Welcome",
    passage: "Luke 15:20",
    reading: "And he arose, and came to his father. But when he was yet a great way off, his father saw him, and had compassion, and ran, and fell on his neck, and kissed him.",
    lessonPrompt: "Speak on God's readiness to welcome us home no matter how far we've wandered.",
  },
  {
    title: "Faithful in Little Things",
    passage: "Luke 16:10",
    reading: "He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.",
    lessonPrompt: "Speak on the importance of integrity and diligence in the small, unseen things.",
  },
  {
    title: "Overcoming the World",
    passage: "1 John 5:4",
    reading: "For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith.",
    lessonPrompt: "Speak on the victory believers already have in Christ over fear, sin, and worldly pressure.",
  },
  {
    title: "The Fruit of the Spirit",
    passage: "Galatians 5:22-23",
    reading: "But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith, meekness, temperance: against such there is no law.",
    lessonPrompt: "Speak on what it looks like to grow in Christlike character through the Holy Spirit.",
  },
  {
    title: "Do Not Be Anxious",
    passage: "Matthew 6:34",
    reading: "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.",
    lessonPrompt: "Speak on living present-mindedly and trusting God with tomorrow's uncertainties.",
  },
  {
    title: "Building on the Rock",
    passage: "Matthew 7:24-25",
    reading: "Whosoever heareth these sayings of mine, and doeth them, I will liken him unto a wise man, which built his house upon a rock: And the rain descended, and the floods came, and the winds blew, and beat upon that house; and it fell not: for it was founded upon a rock.",
    lessonPrompt: "Speak on building life's foundation on obedience to God's Word rather than shifting circumstances.",
  },
  {
    title: "Strength in Weakness",
    passage: "2 Corinthians 12:9",
    reading: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.",
    lessonPrompt: "Speak on how God's power often shows up most clearly in our weakest moments.",
  },
  {
    title: "A Cheerful Giver",
    passage: "Proverbs 11:25",
    reading: "The liberal soul shall be made fat: and he that watereth shall be watered also himself.",
    lessonPrompt: "Speak on how generosity toward others often becomes a blessing back to ourselves.",
  },
  {
    title: "Press Toward the Goal",
    passage: "Philippians 3:13-14",
    reading: "Brethren, I count not myself to have apprehended: but this one thing I do, forgetting those things which are behind, and reaching forth unto those things which are before, I press toward the mark for the prize of the high calling of God in Christ Jesus.",
    lessonPrompt: "Speak on letting go of past failures and pressing forward in pursuit of God's calling.",
  },
  {
    title: "The Lord Is Near",
    passage: "Psalm 34:18",
    reading: "The LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.",
    lessonPrompt: "Speak on God's closeness to the brokenhearted and comfort for those going through grief or pain.",
  },
  {
    title: "Encourage One Another",
    passage: "1 Thessalonians 5:11",
    reading: "Wherefore comfort yourselves together, and edify one another, even as also ye do.",
    lessonPrompt: "Speak on the responsibility believers have to build each other up in community.",
  },
  {
    title: "Trust in the Lord",
    passage: "Proverbs 3:5-6",
    reading: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    lessonPrompt: "Speak on surrendering our own understanding and trusting God's direction for our lives.",
  },
  {
    title: "Set Your Mind Above",
    passage: "Colossians 3:1-2",
    reading: "If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God. Set your affection on things above, not on things on the earth.",
    lessonPrompt: "Speak on shifting our focus from temporary things to eternal, kingdom-minded living.",
  },
  {
    title: "God's Unfailing Love",
    passage: "Romans 8:38-39",
    reading: "For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come... shall be able to separate us from the love of God, which is in Christ Jesus our Lord.",
    lessonPrompt: "Speak on the security believers have in God's unshakable, unfailing love.",
  },
  {
    title: "Delight Yourself in the Lord",
    passage: "Psalm 37:4",
    reading: "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.",
    lessonPrompt: "Speak on finding true joy and satisfaction in a relationship with God above all else.",
  },
  {
    title: "The Great Commission",
    passage: "Matthew 28:19-20",
    reading: "Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: Teaching them to observe all things whatsoever I have commanded you: and, lo, I am with you alway.",
    lessonPrompt: "Speak on our calling to share the Gospel and disciple others, and the promise of Christ's presence in that mission.",
  },
  {
    title: "Rest for the Weary",
    passage: "Matthew 11:28",
    reading: "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
    lessonPrompt: "Speak on finding true rest in Christ amid busyness, burnout, or weariness.",
  },
  {
    title: "Speak Truth in Love",
    passage: "Ephesians 4:15",
    reading: "But speaking the truth in love, may grow up into him in all things, which is the head, even Christ.",
    lessonPrompt: "Speak on honest, loving communication within community and relationships.",
  },
  {
    title: "God Works All Things for Good",
    passage: "Romans 8:28",
    reading: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    lessonPrompt: "Speak on trusting God's sovereignty even in difficult or confusing circumstances.",
  },
  {
    title: "A Servant's Heart",
    passage: "Mark 10:45",
    reading: "For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many.",
    lessonPrompt: "Speak on following Christ's example of humble service rather than seeking status.",
  },
  {
    title: "Faith Without Works",
    passage: "James 2:17",
    reading: "Even so faith, if it hath not works, is dead, being alone.",
    lessonPrompt: "Speak on living out our faith through action, not just belief alone.",
  },
  {
    title: "The Narrow Gate",
    passage: "Matthew 7:13-14",
    reading: "Enter ye in at the strait gate: for wide is the gate, and broad is the way, that leadeth to destruction... Because strait is the gate, and narrow is the way, which leadeth unto life.",
    lessonPrompt: "Speak on the cost and reward of choosing to follow Christ over the easier, popular path.",
  },
  {
    title: "Abiding in the Vine",
    passage: "John 15:5",
    reading: "I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.",
    lessonPrompt: "Speak on staying connected to Christ as the source of spiritual fruitfulness and growth.",
  },
  {
    title: "Praise in the Storm",
    passage: "Habakkuk 3:17-18",
    reading: "Although the fig tree shall not blossom, neither shall fruit be in the vines... yet I will rejoice in the LORD, I will joy in the God of my salvation.",
    lessonPrompt: "Speak on choosing worship and trust even when circumstances look bleak.",
  },
  {
    title: "The Great Commandment",
    passage: "Matthew 22:37-39",
    reading: "Thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind... Thou shalt love thy neighbour as thyself.",
    lessonPrompt: "Speak on love for God and love for others as the foundation of the Christian life.",
  },
];

export default function AdminDevotionalsManager() {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const q = query(collection(db, "devotions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setDevotionals(
        snap.docs.map((d) => {
          const data = d.data() as Partial<Devotional>;
          return {
            id: d.id,
            title: data.title ?? "",
            passage: data.passage ?? "",
            reading: data.reading ?? "",
            lesson: data.lesson ?? "",
            speaker: data.speaker ?? "",
            used: data.used ?? false,
          };
        })
      );
    });
    return () => unsub();
  }, []);

  const usedTitles = devotionals.filter((d) => d.used).map((d) => d.title.toLowerCase());

  async function handleAdd() {
    setStatus("saving");
    setError("");
    try {
      const created = await addDoc(collection(db, "devotions"), {
        ...DEFAULT_DEVOTIONAL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setEditingId(created.id);
      setStatus("idle");
    } catch (err) {
      console.error("Add devotion failed", err);
      setError(`Unable to add devotion.`);
      setStatus("error");
    }
  }

  async function handleSave(id: string, data: Omit<Devotional, "id">) {
    setStatus("saving");
    try {
      await setDoc(
        doc(db, "devotions", id),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setEditingId(null);
      setStatus("idle");
    } catch (err) {
      console.error("Save devotion failed", err);
      setError(`Unable to save devotion.`);
      setStatus("error");
    }
  }

  async function handleToggleUsed(devotional: Devotional) {
    try {
      await setDoc(
        doc(db, "devotions", devotional.id),
        { used: !devotional.used, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Toggle used failed", err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this devotional?")) return;
    await deleteDoc(doc(db, "devotions", id));
  }

  return (
    <div className="mb-10 animate-fade-in px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-5 mb-8 gap-4">
        <div>
          <h2 className="font-display text-xl text-[var(--text)]">Manage Devotions</h2>
          <p className="text-xs text-[var(--text-dim)] mt-1">Add or edit weekly devotions.</p>
        </div>
        <button 
          type="button" 
          onClick={handleAdd} 
          disabled={status === "saving"}
          className="w-full sm:w-auto rounded-full bg-[var(--sfc-red)] px-6 py-3 text-white text-sm font-bold uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition"
        >
          {status === "saving" ? "Creating..." : "Add Devotion"}
        </button>
      </div>

      {error && <p className="text-xs text-red-400 mb-4 px-2">{error}</p>}

      <div className="grid gap-4">
        {devotionals.map((devotional) => (
          <div key={devotional.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            {editingId === devotional.id ? (
              <DevotionalEditor
                devotional={devotional}
                usedTitles={usedTitles.filter((t) => t !== devotional.title.toLowerCase())}
                onSave={(data) => handleSave(devotional.id, data)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDelete(devotional.id)}
              />
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-[var(--text)]">{devotional.title}</div>
                    {devotional.used && (
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Used
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-dim)] mt-1">
                    {devotional.passage}
                    {devotional.speaker ? ` · Speaker: ${devotional.speaker}` : ""}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button
                    onClick={() => handleToggleUsed(devotional)}
                    className="flex-1 sm:flex-none rounded-full px-5 py-2.5 bg-[var(--surface2)] text-xs font-bold text-[var(--text)] hover:bg-[var(--border)] transition"
                  >
                    {devotional.used ? "Mark unused" : "Mark used"}
                  </button>
                  <button onClick={() => setEditingId(devotional.id)} className="flex-1 sm:flex-none rounded-full px-5 py-2.5 bg-[var(--surface2)] text-xs font-bold text-[var(--text)] hover:bg-[var(--border)] transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(devotional.id)} className="flex-1 sm:flex-none rounded-full px-5 py-2.5 bg-transparent border border-[var(--border)] text-xs font-bold text-red-400 hover:bg-red-950/20 transition">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DevotionalEditor({ devotional, usedTitles, onSave, onCancel, onDelete }: {
  devotional: Devotional;
  usedTitles: string[];
  onSave: (data: Omit<Devotional, "id">) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(devotional.title);
  const [passage, setPassage] = useState(devotional.passage);
  const [reading, setReading] = useState(devotional.reading);
  const [lesson, setLesson] = useState(devotional.lesson);
  const [speaker, setSpeaker] = useState(devotional.speaker);
  const [used, setUsed] = useState(devotional.used);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [speakerPrompt, setSpeakerPrompt] = useState<string | null>(null);

  function handleSuggestTopic() {
    const available = TOPIC_SUGGESTIONS.filter(
      (s) => !usedTitles.includes(s.title.toLowerCase())
    );
    const pool = available.length > 0 ? available : TOPIC_SUGGESTIONS;
    const nextIndex = suggestionIndex % pool.length;
    const suggestion = pool[nextIndex];
    setTitle(suggestion.title);
    setPassage(suggestion.passage);
    setReading(suggestion.reading);
    setSpeakerPrompt(suggestion.lessonPrompt);
    setSuggestionIndex(nextIndex + 1);
  }

  const inputClass = "w-full bg-[var(--surface2)] border border-[var(--border)] rounded-xl px-4 py-3.5 text-sm text-[var(--text)] focus:border-[var(--sfc-red)] outline-none transition";
  const labelClass = "block font-mono-sfc text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1 pl-1";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ title, passage, reading, lesson, speaker, used });
      }}
      className="space-y-4"
    >
      <button
        type="button"
        onClick={handleSuggestTopic}
        className="w-full rounded-xl border border-dashed border-[var(--sfc-red)] bg-[rgba(227,27,35,0.05)] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[var(--sfc-red)] hover:bg-[rgba(227,27,35,0.1)] transition"
      >
        ✨ Suggest a topic &amp; reading
      </button>

      {speakerPrompt && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--sfc-red)] mb-1">
            Admin-only speaker note (not published)
          </div>
          <p className="text-xs text-[var(--text-dim)]">{speakerPrompt}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Speaker</label>
          <input
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            placeholder="Who's speaking this week?"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Passage reference</label>
        <input value={passage} onChange={(e) => setPassage(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Bible reading</label>
        <textarea value={reading} onChange={(e) => setReading(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Lesson</label>
        <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} rows={4} className={`${inputClass} resize-none`} />
        <p className="text-[10px] text-[var(--text-dim)] mt-1 pl-1">This is the public lesson text shown on the Devotions page — write the finished lesson here.</p>
      </div>

      <label className="flex items-center gap-2.5 text-xs text-[var(--text-dim)] cursor-pointer select-none pl-1">
        <input type="checkbox" checked={used} onChange={(e) => setUsed(e.target.checked)} className="accent-[var(--sfc-red)]" />
        Mark this topic as used
      </label>
      
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.03)] mt-6 gap-3">
        <button type="button" onClick={onDelete} className="text-xs font-bold text-red-400 hover:text-red-300 transition px-4 py-2">
          Delete Devotional
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={onCancel} className="flex-1 sm:flex-none rounded-full px-6 py-3 bg-[var(--surface2)] text-xs font-bold hover:bg-[var(--border)] transition">Cancel</button>
          <button type="submit" className="flex-1 sm:flex-none rounded-full bg-[var(--sfc-red)] px-6 py-3 text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 transition">Save Changes</button>
        </div>
      </div>
    </form>
  );
}