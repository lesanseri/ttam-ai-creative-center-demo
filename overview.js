let overviewMetric='ctr',overviewPeriod='current';
const overviewDays={current:['10/12','10/13','10/14','10/15','10/16','10/17','10/18'],previous:['10/05','10/06','10/07','10/08','10/09','10/10','10/11']};
const overviewMetrics=[
 {id:'spend',label:'Spend',icon:'chart',unit:'USD',step:500,decimals:2,current:[980,1120,1090,1240,1310,1290,1390],previous:[930,1010,1080,1150,1200,1260,1374],recommendation:{title:'Expand creative coverage',strategy:'remix',assetIds:['s1','s2','a1'],description:'Explore more video variations and language versions when creative coverage limits delivery.'}},
 {id:'ltv',label:'LTV',icon:'bag',unit:'USD',step:10,decimals:2,current:[40.6,41.1,41.5,41.2,42,42.4,42.8],previous:[39.5,40.1,40.4,40.8,40.7,41,41.31]},
 {id:'ctr',label:'CTR',icon:'arrow',unit:'%',step:.5,decimals:2,current:[1.68,1.63,1.58,1.54,1.49,1.45,1.42],previous:[1.8,1.77,1.73,1.69,1.66,1.64,1.62],recommendation:{title:'Make your CTA stand out',strategy:'enhance-cta',assetIds:['s1','s2','a1'],description:'Test a clearer call to action on these creatives. Review the campaign scope and Brand Kit before applying.'}},
 {id:'cvr',label:'CVR',icon:'layers',unit:'%',step:1,decimals:2,current:[3.31,3.45,3.4,3.48,3.51,3.54,3.58],previous:[3.2,3.28,3.24,3.31,3.34,3.4,3.44],recommendation:{title:'Highlight product benefits',strategy:'overlay',assetIds:['s1','s2','a2'],description:'Test a more visible product benefit using visual callouts. Review the selected videos and campaign settings.'}},
 {id:'bounce',label:'2-second bounce rate',icon:'play',unit:'%',step:20,decimals:1,current:[67.1,67.8,68.5,69.1,70.2,70.8,71.4],previous:[65.3,65.8,66.1,66.4,66.8,67.1,67.29],recommendation:{title:'Open with a product demo',strategy:'remix',assetIds:['s1','s2','a1','a2'],description:'Test a product demonstration in the opening seconds by reordering your existing footage. Preview new versions before use.'}}
];
function ensureCreativeLabels(){if(!state.aiLabels){state.aiLabels={s1:'generated',s2:'generated',a1:'assisted'};save();}}
function overviewCampaigns(){return state.campaigns.filter(c=>c.active&&(state.assets.some(a=>a.uses.some(u=>u.campaign===c.id&&u.active))||Object.values(state.strategyCampaigns||{}).some(s=>s.campaignIds.includes(c.id))));}
function overviewData(id=overviewMetric){
 const config=overviewMetrics.find(m=>m.id===id)||overviewMetrics[2];
 const current=overviewPeriod==='current'?config.current:config.previous;
 const previous=overviewPeriod==='current'?config.previous:config.previous.map(v=>v*.98);
 const aggregate=series=>config.id==='spend'?series.reduce((a,b)=>a+b,0):series.at(-1);
 const value=aggregate(current),change=(value/aggregate(previous)-1)*100;
 return {...config,current,previous,value,change,legends:['This period','Previous period']};
}
function overviewFormat(d,n){return d.unit==='USD'?'$'+n.toLocaleString('en-US',{minimumFractionDigits:d.decimals,maximumFractionDigits:d.decimals}):n.toFixed(d.decimals)+'%';}
function overviewRecommendationAssets(recommendation){return recommendation.assetIds.map(id=>getA(id)).filter(a=>a&&a.status!=='rejected');}
function overviewChartHTML(){
 const d=overviewData(),days=overviewDays[overviewPeriod],max=Math.ceil(Math.max(...d.current,...d.previous)/d.step)*d.step;
 const min=d.id==='ctr'?1:0,width=1200,height=240,left=64,right=20,top=15,bottom=30;
 const x=i=>left+i*(width-left-right)/6,y=n=>height-bottom-(n-min)/(max-min)*(height-top-bottom),points=series=>series.map((n,i)=>x(i)+','+y(n)).join(' ');
 const axis=n=>d.unit==='%'?n.toFixed(d.step<1?1:0)+'%':(d.id==='ltv'?'$':'')+n.toLocaleString('en-US');
 let grid='';for(let v=min;v<=max+.0001;v+=d.step)grid+='<line class="ov-grid" x1="'+left+'" x2="'+(width-right)+'" y1="'+y(v)+'" y2="'+y(v)+'"/><text class="ov-axis" x="'+(left-12)+'" y="'+(y(v)+4)+'" text-anchor="end">'+axis(v)+'</text>';
 const lines=[d.previous,d.current].map((series,j)=>'<polyline class="ov-line '+(j?'current':'previous')+'" points="'+points(series)+'"/>').join('');
 const dots=d.current.map((n,i)=>'<g tabindex="0" role="img" aria-label="'+days[i]+': '+esc(d.label)+' '+overviewFormat(d,n)+'"><title>'+days[i]+' · This period: '+overviewFormat(d,n)+' · Previous period: '+overviewFormat(d,d.previous[i])+'</title><circle class="ov-point" cx="'+x(i)+'" cy="'+y(n)+'" r="3"/></g>').join('');
 return '<div class="ov-chart-head"><div class="ov-legend"><span><i></i>This period</span><span><i class="previous"></i>Previous period</span></div><span class="ov-chart-unit">'+d.label+(d.unit==='USD'?' (USD)':'')+' · Daily</span></div><svg class="ov-chart" viewBox="0 0 '+width+' '+height+'" role="img" aria-labelledby="overview-chart-title overview-chart-description"><title id="overview-chart-title">'+esc(d.label)+' trend</title><desc id="overview-chart-description">'+days.map((day,i)=>day+': '+overviewFormat(d,d.current[i])).join('; ')+'</desc>'+grid+lines+dots+days.map((day,i)=>'<text class="ov-axis" x="'+x(i)+'" y="'+(height-7)+'" text-anchor="middle">'+day+'</text>').join('')+'</svg>';
}
function overviewPeriodHTML(){return '<label class="ov-period"><span class="sr-only">Overview period</span><select id="overview-period" aria-label="Overview period"><option value="current"'+(overviewPeriod==='current'?' selected':'')+'>Oct 12–18, 2026</option><option value="previous"'+(overviewPeriod==='previous'?' selected':'')+'>Oct 5–11, 2026</option></select></label>';}
function aiOverviewHTML(){
 return '<section class="ai-overview" aria-labelledby="ai-overview-heading"><div class="ov-section-head"><h1 id="ai-overview-heading">Overview <span class="heading-annotation">（你现在用得怎么样）</span></h1>'+overviewPeriodHTML()+'</div><div class="ov-metrics" role="group" aria-label="Choose an overview metric">'+overviewMetrics.map(config=>{
 const d=overviewData(config.id),positive=config.id==='bounce'?d.change<0:config.id==='spend'?null:d.change>=0;
 const recommendation=config.recommendation,assets=recommendation?overviewRecommendationAssets(recommendation):[],applied=state.overviewRecommendations?.[config.id];
 return '<article class="ov-metric" data-selected="'+(overviewMetric===config.id)+'"><button type="button" class="ov-metric-select" data-overview-metric="'+config.id+'" aria-pressed="'+(overviewMetric===config.id)+'" aria-controls="overview-trend"><span class="ov-metric-label">'+I(config.icon)+esc(config.label)+'</span><span class="ov-metric-number">'+overviewFormat(d,d.value)+'</span><span class="ov-metric-change '+(positive===null?'':positive?'positive':'negative')+'">'+(d.change>=0?'↑ +':'↓ −')+Math.abs(d.change).toFixed(1)+'% <small>vs previous period</small></span></button><div class="ov-recommendation">'+(recommendation&&assets.length?(applied?'<span class="ov-recommendation-copy"><b>Settings applied</b><small>'+esc(recommendation.title)+'</small></span><button type="button" class="ov-apply ov-apply-applied" data-overview-apply="'+config.id+'" aria-label="Review '+esc(recommendation.title)+' settings">Review</button>':'<span class="ov-recommendation-copy"><b>'+esc(recommendation.title)+'</b><small>'+assets.length+' creatives</small></span><button type="button" class="ov-apply" data-overview-apply="'+config.id+'" aria-label="Apply: '+esc(recommendation.title)+'">Apply</button>'):'<span class="ov-no-suggestions">No new suggestions</span>')+'</div></article>';
 }).join('')+'</div><div id="overview-trend" aria-live="polite">'+overviewChartHTML()+'</div></section>';
}
function refreshAIOverview(){const region=document.querySelector('.ai-overview');if(region)region.outerHTML=aiOverviewHTML();}
function openOverviewRecommendation(id){openMetricStrategyRecommendations(id);}
function openCreativeLabels(){
 ensureCreativeLabels();let modal=document.querySelector('#overview-label-dialog');if(!modal){modal=document.createElement('dialog');modal.id='overview-label-dialog';modal.className='brand-kit-dialog ov-label-dialog';document.body.append(modal);}
 const unlabeled=state.assets.filter(a=>a.status!=='rejected'&&!state.aiLabels[a.id]),assets=unlabeled.length?unlabeled:state.assets.filter(a=>a.status!=='rejected');
 modal.setAttribute('aria-labelledby','ov-label-heading');modal.innerHTML='<form id="overview-label-form"><header class="bk-dialog-head"><h2 id="ov-label-heading">Label AI creatives</h2><button class="dialog-close" type="button" data-overview-close aria-label="Close AI labeling">'+scIcon('close')+'</button></header><div class="ov-label-body"><p>Choose creatives and confirm the AI label to apply.</p><label class="ov-label-select">AI label<select class="input" name="label"><option value="suggested">Use suggested labels</option><option value="generated">AI-generated</option><option value="assisted">AI-assisted</option></select></label><div class="ov-label-list">'+assets.map(a=>'<label class="ov-label-row"><input type="checkbox" name="creatives" value="'+a.id+'"'+(!state.aiLabels[a.id]?' checked':'')+'><img src="'+img(a.img)+'" alt=""><span><b>'+esc(a.name)+'</b><small>'+esc(a.strategy==='seedance'?'Seedance':'Audio refresh')+'</small></span><span class="ov-label-chip">'+(state.aiLabels[a.id]?'Labeled · ':'Suggested · ')+((state.aiLabels[a.id]||(a.strategy==='seedance'?'generated':'assisted'))==='generated'?'AI-generated':'AI-assisted')+'</span></label>').join('')+'</div><p class="bk-error" id="ov-label-error" role="alert"></p></div><footer class="bk-dialog-footer"><span class="bk-future-note">Labels apply to selected creatives.</span><div><button class="btn" type="button" data-overview-close>Cancel</button><button class="btn primary" type="submit">Apply labels</button></div></footer></form>';modal.showModal();
}
document.addEventListener('click',e=>{
 const apply=e.target.closest('[data-overview-apply]');if(apply){openOverviewRecommendation(apply.dataset.overviewApply);return;}
 const metric=e.target.closest('[data-overview-metric]');if(metric){overviewMetric=metric.dataset.overviewMetric;document.querySelectorAll('[data-overview-metric]').forEach(b=>{const selected=b.dataset.overviewMetric===overviewMetric;b.setAttribute('aria-pressed',String(selected));b.closest('.ov-metric').dataset.selected=String(selected);});document.querySelector('#overview-trend').innerHTML=overviewChartHTML();return;}
 if(e.target.closest('[data-overview-close]')){document.querySelector('#overview-label-dialog').close();return;}
 if(e.target.id==='overview-label-dialog'){e.target.close();return;}
 const b=e.target.closest('[data-overview]');if(!b)return;if(b.dataset.overview==='labels'){openCreativeLabels();return;}
 const target=document.querySelector('#campaigns-heading');if(target){target.tabIndex=-1;target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});target.focus({preventScroll:true});}
});
document.addEventListener('change',e=>{if(e.target.id==='overview-period'){overviewPeriod=e.target.value;refreshAIOverview();document.querySelector('#overview-period').focus();}});
document.addEventListener('submit',e=>{if(e.target.id!=='overview-label-form')return;e.preventDefault();const data=new FormData(e.target),ids=data.getAll('creatives');if(!ids.length){document.querySelector('#ov-label-error').textContent='Choose at least one creative.';return;}ids.forEach(id=>{const a=getA(id);state.aiLabels[id]=data.get('label')==='suggested'?(a.strategy==='seedance'?'generated':'assisted'):data.get('label');});save();document.querySelector('#overview-label-dialog').close();refreshAIOverview();notify('AI labels applied to '+ids.length+' creative'+(ids.length===1?'':'s')+'.');});


