import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { config } from "./config";
import { nav, services, steps, faq, problems, included, turnkey, ringColors, stats, layers, heroBadges } from "./content";
import { useData, saveStored, clearStored, type Plan, type Project, type SiteData } from "./data";
import { Logo, Mark } from "./Logo";

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={"reveal" + (on ? " on" : "")}>{children}</div>;
}

function Tg({ children, cls = "btn" }: { children: ReactNode; cls?: string }) {
  if (!config.telegramUrl) return null; // нет username — кнопку не показываем
  return <a className={cls} href={config.telegramUrl} target="_blank" rel="noopener noreferrer">{children}</a>;
}

const safe = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : "");
function ProjectCard({ p, i }: { p: Project; i: number }) {
  const url = safe(p.url), img = safe(p.image) || (p.image?.startsWith("/") ? p.image : "");
  return (<article className={"proj p" + (i % 4)}>
    {img && <img src={img} alt={p.title} loading="lazy" />}
    <p className="idx">{p.category}</p><h3>{p.title}</h3>
    <p><b>Задача:</b> {p.task}</p><p><b>Решение:</b> {p.solution}</p>
    <p className="tech">{p.tech.join(" · ")}</p>
    {url && <a className="btn sm" href={url} target="_blank" rel="noopener noreferrer">Открыть проект →</a>}</article>);
}
function PlanCard({ p }: { p: Plan }) {
  return (<article className="plan"><h3>{p.name}</h3><p>{p.who}</p>
    <h4>Входит</h4><ul>{p.include.map(x => <li key={x}>{x}</li>)}</ul>
    <h4>Не входит</h4><ul>{p.exclude.map(x => <li key={x}>{x}</li>)}</ul>
    <h4>Нужно для расчёта</h4><p>{p.need}</p>
    <p className="price">{p.price || "Стоимость рассчитывается по задаче"}</p>
    {p.term && <p>Срок: {p.term}</p>}<a className="btn sm" href="#contact">Обсудить проект</a></article>);
}
function Intro() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [ph, setPh] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (ph >= 2) return;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setPh(ph + 1), ph === 0 ? 1600 : 900);
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [ph]);
  if (ph >= 2) return null;
  return (<div className={"intro" + (ph === 1 ? " out" : "")} aria-hidden="true"><div className="iw"><Mark size={84} /><b>NEO</b><small>Digital Studio</small></div></div>);
}
function CodeWin() {
  return (<div className="code" aria-hidden="true"><div className="dots"><i /><i /><i /></div><pre><code>
<span className="c">// neo.config.ts</span>{"\n"}<span className="k">export const</span> studio = {"{"}{"\n"}  name: <span className="s">"NEO"</span>,{"\n"}  ceo: <span className="s">"Neki"</span>,{"\n"}  builds: [<span className="s">"sites"</span>, <span className="s">"apps"</span>,{"\n"}    <span className="s">"bots"</span>, <span className="s">"ai"</span>],{"\n"}  status: <span className="s">"ready"</span><span className="cur">▍</span>{"\n"}{"}"};</code></pre></div>);
}
function Admin({ initial }: { initial: SiteData }) {
  const expected = config.adminPassword;
  const [authed, setAuthed] = useState(() => {
    if (!expected) return false;
    return sessionStorage.getItem("neo_ed_ok") === "1";
  });
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [fails, setFails] = useState(0);
  const [d, setD] = useState<SiteData>(initial);

  const plan = (i: number, k: "price" | "term" | "who", v: string) =>
    setD({ ...d, plans: d.plans.map((p, j) => (j === i ? { ...p, [k]: v } : p)) });
  const proj = (i: number, k: keyof Project, v: string) =>
    setD({
      ...d,
      projects: d.projects.map((p, j) =>
        j === i ? ({ ...p, [k]: k === "tech" ? v.split(",").map((x) => x.trim()).filter(Boolean) : v } as Project) : p
      ),
    });
  const persist = () => { saveStored(d); };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }));
    a.download = "data.json";
    a.click();
  };
  const f: (keyof Project)[] = ["title", "category", "task", "solution", "url", "image"];

  const tryLogin = () => {
    if (!expected) {
      setErr("Пароль не задан в .env (VITE_ADMIN_PASSWORD).");
      return;
    }
    if (fails >= 5) {
      setErr("Слишком много попыток. Обновите страницу позже.");
      return;
    }
    if (pw === expected) {
      sessionStorage.setItem("neo_ed_ok", "1");
      setAuthed(true);
      setErr("");
    } else {
      setFails((n) => n + 1);
      setErr("Неверный пароль");
    }
  };

  if (!expected) {
    return (
      <main className="wrap admin">
        <h1>Редактор закрыт</h1>
        <p className="lead">Задайте <code>VITE_ADMIN_PASSWORD</code> в файле <code>.env</code> и перезапустите dev-сервер (или пересоберите сайт).</p>
        <a className="btn ghost" href="#top">На сайт</a>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="wrap admin" style={{ minHeight: "70vh", display: "grid", placeContent: "center" }}>
        <div style={{ width: "min(360px, 100%)", textAlign: "center" }}>
          <h1>Вход</h1>
          <p className="lead">Редактор контента NEO</p>
          <label style={{ display: "grid", gap: 8, textAlign: "left", margin: "20px 0" }}>
            Пароль
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryLogin()}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              style={{ minHeight: 48 }}
            />
          </label>
          {err && <p className="note" style={{ color: "#ff8a80" }}>{err}</p>}
          <div className="cta" style={{ justifyContent: "center" }}>
            <button type="button" className="btn" onClick={tryLogin}>Войти</button>
            <a className="btn ghost" href="#top">На сайт</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap admin">
      <h1>Редактор</h1>
      <p className="lead">«Сохранить» — правки сразу на сайте в этом браузере. «Скачать» — файл для замены data.json на сервере.</p>

      <h2>Тарифы</h2>{d.plans.map((p, i) => (<div className="arow" key={p.name}><b>{p.name}</b>
      <label>Цена<input value={p.price} placeholder="от 30 000 ₽" onChange={e => plan(i, "price", e.target.value)} /></label>
      <label>Срок<input value={p.term} placeholder="5–7 дней" onChange={e => plan(i, "term", e.target.value)} /></label>
      <label className="wide">Для кого<input value={p.who} onChange={e => plan(i, "who", e.target.value)} /></label></div>))}
    <h2>Дополнительно</h2>{d.extras.map((x, i) => (<div className="arow" key={i}>
      <label>Название<input value={x.name} onChange={e => setD({ ...d, extras: d.extras.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) })} /></label>
      <label>Цена<input value={x.price} placeholder="от 5 000 ₽" onChange={e => setD({ ...d, extras: d.extras.map((y, j) => (j === i ? { ...y, price: e.target.value } : y)) })} /></label>
      <button className="btn ghost sm" onClick={() => setD({ ...d, extras: d.extras.filter((_, j) => j !== i) })}>Удалить</button></div>))}
    <button className="btn ghost sm" onClick={() => setD({ ...d, extras: [...d.extras, { name: "", price: "" }] })}>+ Добавить услугу</button>
    <h2>Проекты</h2>{d.projects.map((p, i) => (<div className="acard" key={i + "-" + d.projects.length}>
      {f.map(k => <label key={k}>{k}<input value={String(p[k] ?? "")} onChange={e => proj(i, k, e.target.value)} /></label>)}
      <label>tech (через запятую)<input defaultValue={p.tech.join(", ")} onBlur={e => proj(i, "tech", e.target.value)} /></label>
      <button className="btn ghost sm" onClick={() => setD({ ...d, projects: d.projects.filter((_, j) => j !== i) })}>Удалить</button></div>))}
    <div className="cta"><button className="btn ghost" onClick={() => setD({ ...d, projects: [...d.projects, { title: "", category: "", task: "", solution: "", tech: [], url: "", image: "" }] })}>+ Добавить проект</button>
      <button className="btn" onClick={() => { persist(); alert("Сохранено. Обновите главную — данные уже на сайте."); }}>Сохранить</button>
      <button className="btn ghost" onClick={download}>Скачать JSON</button>
      <button className="btn ghost" onClick={() => { clearStored(); location.reload(); }}>Сброс</button>
      <a className="btn ghost" href="#top" onClick={() => location.reload()}>На сайт</a></div></main>);
}
function Scope() {
  const [a, setA] = useState(0);
  const [t, d] = included[a];
  return (<div className="scope"><ul>{included.map(([n], i) => <li key={n}><button className={a === i ? "on" : ""} aria-pressed={a === i} onClick={() => setA(i)}><span>{String(i + 1).padStart(2, "0")}</span>{n}</button></li>)}</ul>
    <div className="pane" style={{ borderColor: ringColors[a % ringColors.length] }}><h3>{t}</h3><p>{d}</p></div></div>);
}
function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    nav.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (<header className="hdr"><div className="wrap row">
    <a href="#top" aria-label="NEO — на главную"><Logo /></a>
    <button className="burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>{open ? "Закрыть" : "Меню"}</button>
    <nav id="menu" className={open ? "open" : ""} aria-label="Основная">
      {nav.map(([id, l]) => <a key={id} href={"#" + id} aria-current={active === id ? "true" : undefined} onClick={() => setOpen(false)}>{l}</a>)}
      <a className="btn sm" href="#contact" onClick={() => setOpen(false)}>Обсудить проект</a>
    </nav></div></header>);
}

function Faq() {
  const [o, setO] = useState<number | null>(0);
  return (<div className="faq">{faq.map(([q, a], i) => (<div key={q} className="qa">
    <h3><button id={"q" + i} aria-expanded={o === i} aria-controls={"a" + i} onClick={() => setO(o === i ? null : i)}>{q}<span aria-hidden="true">{o === i ? "−" : "+"}</span></button></h3>
    <div id={"a" + i} role="region" aria-labelledby={"q" + i} hidden={o !== i}><p>{a}</p></div></div>))}</div>);
}

type St = "idle" | "sending" | "error" | "noBackend" | "ok";
function Contact() {
  const [st, setSt] = useState<St>("idle");
  const [err, setErr] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = { name: String(f.get("name") || "").trim(), contact: String(f.get("contact") || "").trim(), type: String(f.get("type") || ""), budget: String(f.get("budget") || "").trim(), task: String(f.get("task") || "").trim(), website: String(f.get("website") || "") };
    if (d.name.length < 2) return (setErr("Укажите имя."), setSt("error"));
    if (d.contact.length < 3) return (setErr("Укажите Telegram или email для ответа."), setSt("error"));
    if (d.task.length < 10) return (setErr("Опишите задачу хотя бы в нескольких словах."), setSt("error"));
    if (d.website) return; // honeypot
    if (!config.formEndpoint) { setSt("noBackend"); return; }
    setSt("sending");
    try {
      const r = await fetch(config.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) throw new Error(String(r.status));
      setSt("ok"); e.currentTarget.reset();
    } catch { setErr("Не удалось отправить. Попробуйте позже или напишите напрямую."); setSt("error"); }
  }
  return (<form className="form" onSubmit={submit} noValidate>
    <label>Имя<input name="name" autoComplete="name" maxLength={80} required /></label>
    <label>Telegram или email<input name="contact" maxLength={120} required /></label>
    <label>Тип услуги<select name="type">{services.map(s => <option key={s[0]}>{s[0]}</option>)}<option>Не знаю, нужна консультация</option></select></label>
    <label>Бюджет (необязательно)<input name="budget" maxLength={60} /></label>
    <label className="full">Задача<textarea name="task" rows={4} maxLength={2000} required /></label>
    <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <button className="btn" disabled={st === "sending"}>{st === "sending" ? "Отправляем…" : "Отправить заявку"}</button>
    <p className="status" role="status" aria-live="polite">
      {st === "error" && err}
      {st === "ok" && "Заявка отправлена. Спасибо!"}
      {st === "noBackend" && "Отправка формы пока не подключена — заявка не была отправлена. Свяжитесь напрямую через контакты ниже."}
    </p></form>);
}

export default function App() {
  const data = useData();
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const h = () => setHash(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    const el = document.getElementById("steps-scroller");
    if (!el) return;
    let down = false, startX = 0, scroll = 0;
    const onDown = (e: PointerEvent) => { down = true; startX = e.clientX; scroll = el.scrollLeft; el.setPointerCapture(e.pointerId); };
    const onMove = (e: PointerEvent) => { if (!down) return; el.scrollLeft = scroll - (e.clientX - startX); };
    const onUp = () => { down = false; };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [hash]);
  if ((hash === "#admin" || hash === "#edit") && data) return <Admin initial={data} />;
  return (<>
    <Intro /><a className="skip" href="#main">К содержимому</a><Header />
    <main id="main">
      <section id="top" className="hero wrap">
        <div className="mesh" aria-hidden="true" />
        <div className="glow" aria-hidden="true" />
        <div className="orb" aria-hidden="true" />
        <p className="idx">NEO DIGITAL STUDIO · Founded by Neki</p>
        <h1>Цифровые продукты, которые <em>работают на бизнес</em></h1>
        <p className="lead">Сайты, веб-приложения, боты и автоматизация — проектируем, разрабатываем и доводим до результата. Один специалист от смысла до запуска.</p>
        <ul className="badges">{heroBadges.map(b => <li key={b}>{b}</li>)}</ul>
        <div className="cta"><a className="btn" href="#contact">Обсудить проект</a><a className="btn ghost" href="#projects">Смотреть проекты</a></div>
        <p className="sig"><b>CEO Neki</b> — основатель и разработчик</p>
        <CodeWin />
        <span className="scroll" aria-hidden="true">scroll ↓</span>
      </section>
      <section id="problem" className="wrap sec"><Reveal><p className="idx">Проблема</p><h2>Сайт без понятной цели — всего лишь дорогая картинка</h2>
        <p className="lead">Человек решает, остаться ему или уйти, за считаные секунды. Мы делаем продукты, которые быстро показывают пользу и подводят к обращению.</p>
        <div className="cards3">{problems.map(([t, d]) => <article key={t} className="pc"><h3>{t}</h3><p>{d}</p></article>)}</div></Reveal></section>
      <section id="services" className="wrap sec"><Reveal><p className="idx">01 / Услуги</p><h2>Что мы делаем</h2>
        <div className="list">{services.map(([t, d, f], i) => (<article key={t} className="svc"><span className="idx">{String(i + 1).padStart(2, "0")}</span><div><h3>{t}</h3><p>{d}</p></div><ul>{f.map(x => <li key={x}>{x}</li>)}</ul><a href="#contact">Обсудить →</a></article>))}</div></Reveal></section>
      <section id="projects" className="wrap sec"><Reveal><p className="idx">02 / Проекты</p><h2>Проекты</h2>
        {data && data.projects.length === 0 && <p className="note">Здесь появятся реальные работы студии.</p>}
        <div className="grid">{data?.projects.map((p, i) => <ProjectCard key={p.title + i} p={p} i={i} />)}</div></Reveal></section>
      <section id="approach" className="wrap sec"><Reveal><p className="idx">03 / Подход</p><h2>От задачи — к архитектуре и коду</h2>
        <p className="lead">Разбираем бизнес-процесс, проектируем структуру и сценарии, рисуем интерфейс и собираем быстрый, поддерживаемый код. Смысл, дизайн и разработка в одних руках. За NEO стоит Neki — основатель и разработчик.</p>
        <div className="stats">{stats.map(([n, l], i) => <div key={l} className="stat"><b style={{ color: ringColors[i] }}>{n}</b><span>{l}</span></div>)}</div>
        <div className="layers">{layers.map(([t, d], i) => <div key={t} className="layer" style={{ borderColor: ringColors[i % ringColors.length] }}><span className="idx">{String(i + 1).padStart(2, "0")}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
        <div className="arch-grid" aria-label="Принципы разработки">
          <div><b>01 · АРХИТЕКТУРА</b><span>Сначала структура и сценарии — потом пиксели. Так проще масштабировать.</span></div>
          <div><b>02 · СКОРОСТЬ</b><span>Лёгкий стек, без лишнего JS. Цель — быстрая первая отрисовка на мобильном.</span></div>
          <div><b>03 · ПРОЗРАЧНОСТЬ</b><span>Этапы, сроки и объём фиксируем до старта. Правки — по согласованным раундам.</span></div>
        </div>
        <p className="note">Схема слоёв — ориентир. Конкретная архитектура всегда под задачу.</p>
        <div className="callout"><div><h3>Эта страница — живой пример</h3><p>Сетка, анимации, тарифы и форма здесь собраны так же, как мы делаем для клиентов: без лишнего веса и с вниманием к деталям.</p></div><a className="btn" href="#pricing">Узнать стоимость</a></div></Reveal></section>
      <section id="scope" className="wrap sec"><Reveal><p className="idx">04 / Что входит</p><h2>Что входит в работу</h2>
        <Scope /></Reveal></section>
      <section id="process" className="wrap sec"><Reveal><p className="idx">05 / Процесс</p><h2>Понятный путь от первого разговора до запуска</h2>
        <p className="lead">Сроки и этапы фиксируем до старта. На телефоне этапы можно листать горизонтально.</p>
        <div className="steps-wrap" id="steps-scroller">
          <ol className="steps">{steps.map(([n, title, d]) => <li key={n}><span>{n}</span><h3>{title}</h3><p>{d}</p></li>)}</ol>
        </div>
</Reveal></section>
      <section id="pricing" className="wrap sec"><Reveal><p className="idx">06 / Стоимость</p><h2>Стоимость без скрытых доплат</h2>
        <p className="lead">Сначала обсуждаем задачу, затем согласуем сумму, сроки и этапы оплаты — до начала работ.</p>
        <div className="plans">{data?.plans.map(p => <PlanCard key={p.name} p={p} />)}</div>
        {!!data?.extras.length && <div className="extras"><h3>Дополнительно</h3>{data.extras.map(x => <div key={x.name}><span>{x.name}</span><b>{x.price || "по запросу"}</b></div>)}</div>}</Reveal></section>
      <section id="turnkey" className="wrap sec"><Reveal><p className="idx">07 / Под ключ</p><h2>Сайт под ключ — от идеи до первых обращений</h2>
        <p className="lead">«Под ключ» означает, что не нужно искать отдельно аналитика, дизайнера и разработчика: весь путь ведём вместе. Работаем удалённо — обсуждаем и согласуем всё в мессенджере или по видеосвязи.</p>
        <ul className="chips">{turnkey.map(([t, d], i) => <li key={t}><span>{String(i + 1).padStart(2, "0")}</span><b>{t}</b><small>{d}</small></li>)}</ul></Reveal></section>
      <section id="faq" className="wrap sec"><Reveal><p className="idx">08 / FAQ</p><h2>Частые вопросы</h2><Faq /></Reveal></section>
      <section id="contact" className="wrap sec contact"><Reveal><p className="idx">09 / Контакты</p><h2>Есть задача? Давайте превратим её в работающий продукт</h2>
        <p className="lead">Расскажи, что нужно создать или улучшить. Обсудим решение, объём работ и дальнейшие шаги.</p>
        <div className="cta"><Tg>Написать в Telegram</Tg>{config.email && <a className="btn ghost" href={"mailto:" + config.email}>{config.email}</a>}</div>
        {!config.telegramUrl && !config.email && <p className="note">Контакты ещё не настроены: заполните .env (см. README).</p>}
        <Contact /></Reveal></section>
    </main>
    <footer className="ftr"><div className="wrap fgrid"><div><Logo /><p>Независимая цифровая студия. CEO Neki.</p></div>
      <nav aria-label="Разделы"><h4>Разделы</h4>{nav.map(([id, l]) => <a key={id} href={"#" + id}>{l}</a>)}</nav>
      <nav aria-label="Услуги"><h4>Услуги</h4>{services.slice(0, 4).map(([t]) => <a key={t} href="#services">{t}</a>)}</nav>
      <nav aria-label="Контакты"><h4>Контакты</h4><a href="#contact">Оставить заявку</a>{config.telegramUrl && <a href={config.telegramUrl} target="_blank" rel="noopener noreferrer">Telegram</a>}{config.email && <a href={"mailto:" + config.email}>{config.email}</a>}</nav>
      <p className="copy">© {new Date().getFullYear()} NEO</p></div></footer>
  </>);
}
