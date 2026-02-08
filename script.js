
const obs=new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting&&x.target.classList.add('show')));
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

const errorBox=document.getElementById('errorBox');
document.getElementById('errorSelect').addEventListener('change',e=>{
const v=e.target.value;
if(v==='gradle') errorBox.innerHTML='<b>Cause:</b> Gradle wrapper outdated<br><b>Fix:</b> Update gradle-wrapper.properties';
if(v==='jdk') errorBox.innerHTML='<b>Cause:</b> Wrong Java version<br><b>Fix:</b> Install Java 17';
if(v==='dex') errorBox.innerHTML='<b>Cause:</b> Duplicate classes<br><b>Fix:</b> Remove duplicate deps';
if(v==='r8') errorBox.innerHTML='<b>Cause:</b> Shrinker removed class<br><b>Fix:</b> Add keep rules';
});
