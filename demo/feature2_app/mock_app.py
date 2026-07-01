"""
╔══════════════════════════════════════════════════════════════╗
║  功能点2: 交互式任务模拟                                     ║
║  Interactive Task Simulation on Mock China Mobile App       ║
╚══════════════════════════════════════════════════════════════╝

Flask 模拟中国移动APP + Playwright 自动化交互
"""
import json
import os
import sys
import io
import time
import threading
import random

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from flask import Flask, render_template_string, request, jsonify, redirect, url_for, session

app = Flask(__name__)
app.secret_key = "demo_secret_key_2024"

TEMPLATE_DIR = os.path.dirname(__file__)
LOG_FILE = os.path.join(os.path.dirname(__file__), "..", "output", "interaction_log.jsonl")
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

PAGE_VIEWS = []  # 收集页面访问数据用于旅程分析

# ── 页面模板 ───────────────────────────────────────────

HOME_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>中国移动 - 网上营业厅</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.header{background:linear-gradient(135deg,#006838,#00a650);color:#fff;padding:20px 16px 30px}
.header .title{font-size:22px;font-weight:bold}
.header .subtitle{font-size:13px;opacity:0.85;margin-top:6px}
.header .user-info{display:flex;align-items:center;margin-top:18px;gap:12px}
.header .avatar{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:24px}
.header .phone{font-size:16px;font-weight:bold}
.header .balance{font-size:13px;opacity:0.9}
.cards{padding:16px;margin-top:-20px}
.card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.card-row{display:flex;gap:12px;margin-bottom:12px}
.card-half{flex:1;background:#fff;border-radius:12px;padding:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.card-half .icon{font-size:28px;margin-bottom:6px}
.card-half .label{font-size:12px;color:#666}
.card-half .value{font-size:18px;font-weight:bold;color:#006838;margin-top:4px}
.menu-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:0 16px 16px}
.menu-item{text-align:center;cursor:pointer;padding:10px 4px;border-radius:10px;transition:all 0.2s}
.menu-item:hover{background:#e8f5e9}
.menu-item .icon{font-size:30px;margin-bottom:4px}
.menu-item .label{font-size:11px;color:#333}
.recommend{padding:0 16px 16px}
.recommend h3{font-size:16px;margin-bottom:10px;color:#333}
.recommend-item{background:#fff;border-radius:10px;padding:14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);cursor:pointer}
.recommend-item:hover{background:#f0fdf4}
.recommend-item .name{font-size:14px;font-weight:bold}
.recommend-item .desc{font-size:11px;color:#888;margin-top:2px}
.recommend-item .price{font-size:16px;font-weight:bold;color:#e53935}
.recommend-item .tag{display:inline-block;background:#fff3e0;color:#e65100;font-size:10px;padding:2px 6px;border-radius:4px;margin-left:4px}
.nav{position:sticky;bottom:0;background:#fff;display:flex;border-top:1px solid #eee;padding:8px 0}
.nav-item{flex:1;text-align:center;font-size:10px;color:#999;cursor:pointer;padding:4px 0}
.nav-item.active{color:#006838}
.nav-item .icon{font-size:22px;display:block;margin-bottom:2px}
.banner{background:linear-gradient(135deg,#1a237e,#283593);color:#fff;border-radius:12px;padding:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.banner .text{font-size:14px;font-weight:bold}
.banner .btn{background:#ff6d00;color:#fff;border:none;padding:8px 16px;border-radius:20px;font-size:12px;cursor:pointer}
.search-bar{display:flex;margin:0 16px 16px;background:#fff;border-radius:24px;padding:10px 16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);align-items:center;gap:8px;cursor:pointer}
.search-bar .icon{font-size:18px}
.search-bar .text{font-size:13px;color:#aaa}
</style>
</head>
<body>
<div class="header">
  <div class="title">中国移动</div>
  <div class="subtitle">China Mobile · 网上营业厅</div>
  <div class="user-info">
    <div class="avatar">👤</div>
    <div>
      <div class="phone">138****{{ phone_tail }}</div>
      <div class="balance">账户余额: ¥{{ balance }}</div>
    </div>
  </div>
</div>

<div class="cards">
  <div class="banner">
    <div class="text">🔥 5G极速套餐<br>限时特惠</div>
    <a href="/product/5g-plan" class="btn" style="color:#fff;text-decoration:none">立即查看</a>
  </div>

  <div class="card-row">
    <div class="card-half">
      <div class="icon">📱</div>
      <div class="label">本月已用流量</div>
      <div class="value">{{ data_used }}GB</div>
    </div>
    <div class="card-half">
      <div class="icon">📞</div>
      <div class="label">本月通话</div>
      <div class="value">{{ call_min }}分钟</div>
    </div>
  </div>
</div>

<div class="search-bar" onclick="location.href='/search'">
  <span class="icon">🔍</span>
  <span class="text">搜索套餐、业务、优惠活动...</span>
</div>

<div class="menu-grid">
  {% for item in menu_items %}
  <div class="menu-item" onclick="location.href='{{ item.url }}'">
    <div class="icon">{{ item.icon }}</div>
    <div class="label">{{ item.label }}</div>
  </div>
  {% endfor %}
</div>

<div class="recommend">
  <h3>🎯 为您推荐</h3>
  {% for item in recommendations %}
  <a href="{{ item.url }}" style="text-decoration:none;color:inherit">
    <div class="recommend-item">
      <div>
        <div class="name">{{ item.name }} {% if item.tag %}<span class="tag">{{ item.tag }}</span>{% endif %}</div>
        <div class="desc">{{ item.desc }}</div>
      </div>
      <div class="price">{{ item.price }}</div>
    </div>
  </a>
  {% endfor %}
</div>

<div class="nav">
  <div class="nav-item active" onclick="location.href='/'">
    <span class="icon">🏠</span>首页
  </div>
  <div class="nav-item" onclick="location.href='/products'">
    <span class="icon">📦</span>产品
  </div>
  <div class="nav-item" onclick="location.href='/search'">
    <span class="icon">🔍</span>发现
  </div>
  <div class="nav-item" onclick="location.href='/my-account'">
    <span class="icon">👤</span>我的
  </div>
  <div class="nav-item" onclick="location.href='/support'">
    <span class="icon">💬</span>客服
  </div>
</div>
</body>
</html>"""

PRODUCTS_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>产品中心 - 中国移动</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.header{background:linear-gradient(135deg,#006838,#00a650);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px}
.header .back{cursor:pointer;font-size:18px}
.header .title{font-size:18px;font-weight:bold}
.tabs{display:flex;background:#fff;border-bottom:1px solid #eee;position:sticky;top:0}
.tab{flex:1;text-align:center;padding:12px;font-size:13px;cursor:pointer;border-bottom:2px solid transparent}
.tab.active{color:#006838;border-bottom-color:#006838;font-weight:bold}
.product-list{padding:12px 16px}
.product-card{background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);cursor:pointer}
.product-card:hover{box-shadow:0 4px 16px rgba(0,0,0,0.12)}
.product-card .top{display:flex;justify-content:space-between;align-items:start}
.product-card .name{font-size:15px;font-weight:bold;color:#333}
.product-card .price{font-size:18px;color:#e53935;font-weight:bold}
.product-card .desc{font-size:12px;color:#888;margin:8px 0}
.product-card .tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.tag{padding:3px 8px;border-radius:4px;font-size:10px}
.tag.green{background:#e8f5e9;color:#006838}
.tag.orange{background:#fff3e0;color:#e65100}
.tag.blue{background:#e3f2fd;color:#1565c0}
</style>
</head>
<body>
<div class="header">
  <span class="back" onclick="location.href='/'">←</span>
  <span class="title">产品中心</span>
</div>
<div class="tabs">
  <div class="tab active" id="tab-all">全部</div>
  <div class="tab" id="tab-5g">5G套餐</div>
  <div class="tab" id="tab-family">家庭套餐</div>
  <div class="tab" id="tab-addon">增值业务</div>
</div>
<div class="product-list">
  {% for p in products %}
  <a href="/product/{{ p.id }}" style="text-decoration:none;color:inherit">
    <div class="product-card">
      <div class="top">
        <div>
          <span class="name">{{ p.name }}</span>
          {% if p.hot %}<span style="background:#ffebee;color:#e53935;font-size:10px;padding:2px 6px;border-radius:4px;margin-left:6px">热销</span>{% endif %}
        </div>
        <div class="price">¥{{ p.price }}/月</div>
      </div>
      <div class="desc">{{ p.desc }}</div>
      <div class="tags">
        {% for t in p.tags %}
        <span class="tag {{ t.style }}">{{ t.text }}</span>
        {% endfor %}
      </div>
    </div>
  </a>
  {% endfor %}
</div>

<script>
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});
</script>
</body>
</html>"""

PRODUCT_DETAIL_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ product.name }} - 中国移动</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.header{background:linear-gradient(135deg,#006838,#00a650);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px}
.header .back{cursor:pointer;font-size:18px}
.header .title{font-size:18px;font-weight:bold}
.content{padding:16px}
.hero{background:#fff;border-radius:16px;padding:24px;text-align:center;margin-bottom:16px}
.hero .price{font-size:42px;font-weight:bold;color:#e53935}
.hero .unit{font-size:14px;color:#888}
.hero .name{font-size:20px;font-weight:bold;margin-top:8px}
.hero .desc{font-size:12px;color:#888;margin-top:4px}
.details{background:#fff;border-radius:12px;padding:16px;margin-bottom:16px}
.details h4{font-size:14px;margin-bottom:10px;color:#333}
.detail-item{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
.detail-item:last-child{border-bottom:none}
.detail-item .label{color:#888}
.detail-item .value{color:#333;font-weight:bold}
.actions{padding:0 16px 24px;display:flex;gap:12px}
.btn{border:none;border-radius:24px;padding:14px;font-size:15px;font-weight:bold;cursor:pointer;flex:1}
.btn-primary{background:linear-gradient(135deg,#006838,#00a650);color:#fff}
.btn-outline{border:2px solid #006838;color:#006838;background:#fff}
</style>
</head>
<body>
<div class="header">
  <span class="back" onclick="location.href='/products'">←</span>
  <span class="title">产品详情</span>
</div>
<div class="content">
  <div class="hero">
    <div class="price">¥{{ product.price }}<span class="unit">/月</span></div>
    <div class="name">{{ product.name }}</div>
    <div class="desc">{{ product.long_desc }}</div>
  </div>
  <div class="details">
    <h4>📋 套餐详情</h4>
    {% for item in product.details %}
    <div class="detail-item">
      <span class="label">{{ item.label }}</span>
      <span class="value">{{ item.value }}</span>
    </div>
    {% endfor %}
  </div>
</div>
<div class="actions">
  <button class="btn btn-outline" onclick="alert('已加入对比列表')">加入对比</button>
  <button class="btn btn-primary" id="btn-buy" onclick="handleBuy()">立即办理</button>
</div>
<div id="buy-result" style="text-align:center;padding:0 16px;display:none;"></div>
<script>
function handleBuy() {
  var result = document.getElementById('buy-result');
  result.style.display = 'block';
  result.innerHTML = '<div style="background:#e8f5e9;padding:16px;border-radius:12px;color:#006838">✅ 办理申请已提交！<br><small>订单号: CM' + Date.now().toString(36).toUpperCase() + '</small><br><small>预计24小时内生效</small></div>';
  document.getElementById('btn-buy').textContent = '已提交';
  document.getElementById('btn-buy').disabled = true;
}
</script>
</body>
</html>"""

SEARCH_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>搜索 - 中国移动</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.header{background:#fff;padding:10px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #eee}
.header .back{cursor:pointer;font-size:18px}
.search-input{flex:1;background:#f5f5f5;border:none;border-radius:20px;padding:8px 14px;font-size:14px;outline:none}
.search-btn{background:#006838;color:#fff;border:none;padding:8px 16px;border-radius:20px;font-size:13px;cursor:pointer}
.hot-search{padding:16px}
.hot-search h4{font-size:13px;color:#888;margin-bottom:10px}
.tag-cloud{display:flex;flex-wrap:wrap;gap:8px}
.tag-item{background:#fff;border:1px solid #eee;padding:6px 14px;border-radius:20px;font-size:12px;color:#666;cursor:pointer}
.tag-item:hover{border-color:#006838;color:#006838}
.results{padding:0 16px 16px;display:none}
.result-item{background:#fff;border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.result-item .info .name{font-size:14px;font-weight:bold;color:#333}
.result-item .info .desc{font-size:11px;color:#888;margin-top:2px}
.result-item .price{font-size:16px;color:#e53935;font-weight:bold}
</style>
</head>
<body>
<div class="header">
  <span class="back" onclick="location.href='/'">←</span>
  <input class="search-input" id="searchInput" placeholder="搜索套餐、流量包、业务..." value="{{ query }}">
  <button class="search-btn" onclick="doSearch()">搜索</button>
</div>
<div class="hot-search" id="hotSearch">
  <h4>🔥 热门搜索</h4>
  <div class="tag-cloud">
    <span class="tag-item" onclick="searchTag('移动产品资费')">移动产品资费</span>
    <span class="tag-item" onclick="searchTag('5G套餐')">5G套餐</span>
    <span class="tag-item" onclick="searchTag('流量包')">流量包</span>
    <span class="tag-item" onclick="searchTag('宽带')">宽带</span>
    <span class="tag-item" onclick="searchTag('国际漫游')">国际漫游</span>
    <span class="tag-item" onclick="searchTag('亲情号')">亲情号</span>
    <span class="tag-item" onclick="searchTag('学生套餐')">学生套餐</span>
    <span class="tag-item" onclick="searchTag('携号转网')">携号转网</span>
  </div>
</div>
<div class="results" id="results">
  {% for r in results %}
  <a href="{{ r.url }}" style="text-decoration:none;color:inherit">
    <div class="result-item">
      <div class="info">
        <div class="name">{{ r.name }}</div>
        <div class="desc">{{ r.desc }}</div>
      </div>
      <div class="price">{{ r.price }}</div>
    </div>
  </a>
  {% endfor %}
</div>
<script>
function doSearch() {
  var q = document.getElementById('searchInput').value;
  if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
}
function searchTag(tag) {
  window.location.href = '/search?q=' + encodeURIComponent(tag);
}
document.getElementById('searchInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') doSearch();
});
(function() {
  var q = '{{ query }}';
  if (q) {
    document.getElementById('hotSearch').style.display = 'none';
    document.getElementById('results').style.display = 'block';
  }
})();
</script>
</body>
</html>"""

MY_ACCOUNT_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>我的 - 中国移动</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.header{background:linear-gradient(135deg,#006838,#00a650);color:#fff;padding:30px 16px}
.profile{display:flex;align-items:center;gap:12px}
.avatar{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:28px}
.name{font-size:18px;font-weight:bold}
.phone{font-size:13px;opacity:0.8}
.stats{display:flex;margin-top:20px;gap:0}
.stat{flex:1;text-align:center;border-right:1px solid rgba(255,255,255,0.3)}
.stat:last-child{border-right:none}
.stat .num{font-size:20px;font-weight:bold}
.stat .label{font-size:11px;opacity:0.8;margin-top:2px}
.menu-section{background:#fff;border-radius:12px;margin:16px;padding:8px 0}
.menu-section .title{font-size:13px;color:#888;padding:8px 16px}
.menu-row{display:flex;align-items:center;padding:14px 16px;border-bottom:1px solid #f5f5f5;cursor:pointer;font-size:14px}
.menu-row:last-child{border-bottom:none}
.menu-row .icon{margin-right:10px;font-size:18px}
.menu-row .arrow{margin-left:auto;color:#ccc}
</style>
</head>
<body>
<div class="header">
  <div class="profile">
    <div class="avatar">👤</div>
    <div>
      <div class="name">演示用户</div>
      <div class="phone">138****0000 | 全球通88元</div>
    </div>
  </div>
  <div class="stats">
    <div class="stat">
      <div class="num">12</div>
      <div class="label">在网月数</div>
    </div>
    <div class="stat">
      <div class="num">🌟</div>
      <div class="label">会员等级</div>
    </div>
    <div class="stat">
      <div class="num">2860</div>
      <div class="label">积分</div>
    </div>
  </div>
</div>

<div class="menu-section">
  <div class="title">我的订单</div>
  {% for item in orders %}
  <div class="menu-row">
    <span class="icon">{{ item.icon }}</span>
    <span>{{ item.label }}</span>
    <span class="arrow">›</span>
  </div>
  {% endfor %}
</div>

<div class="menu-section">
  <div class="title">常用服务</div>
  {% for item in services %}
  <div class="menu-row" onclick="location.href='{{ item.url }}'">
    <span class="icon">{{ item.icon }}</span>
    <span>{{ item.label }}</span>
    <span class="arrow">›</span>
  </div>
  {% endfor %}
</div>
</body>
</html>"""

SUPPORT_PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>客服 - 中国移动</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;background:#f5f5f5;max-width:480px;margin:0 auto;min-height:100vh}
.header{background:linear-gradient(135deg,#006838,#00a650);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px}
.header .back{cursor:pointer;font-size:18px}
.header .title{font-size:18px;font-weight:bold}
.chat-area{padding:16px;min-height:60vh;background:#f0f0f0}
.chat-bubble{max-width:80%;padding:12px 16px;border-radius:16px;margin-bottom:12px;font-size:13px;line-height:1.5}
.chat-bubble.bot{background:#fff;border-top-left-radius:4px}
.chat-bubble.user{background:#006838;color:#fff;margin-left:auto;border-top-right-radius:4px}
.qa-list{padding:16px}
.qa-item{background:#fff;border-radius:10px;padding:14px;margin-bottom:8px;cursor:pointer;font-size:13px}
.qa-item:hover{background:#e8f5e9}
.qa-item .q{font-weight:bold;margin-bottom:4px}
.qa-item .a{color:#666;font-size:12px}
.input-area{position:sticky;bottom:0;background:#fff;padding:10px 16px;display:flex;gap:8px;border-top:1px solid #eee}
.input-area input{flex:1;border:1px solid #ddd;border-radius:20px;padding:10px 14px;font-size:13px;outline:none}
.input-area button{background:#006838;color:#fff;border:none;padding:10px 20px;border-radius:20px;font-size:13px;cursor:pointer}
</style>
</head>
<body>
<div class="header">
  <span class="back" onclick="location.href='/'">←</span>
  <span class="title">在线客服</span>
</div>
<div class="chat-area" id="chatArea">
  <div class="chat-bubble bot">您好！我是中国移动智能客服小移 👋<br>有什么可以帮您的吗？</div>
</div>
<div class="qa-list" id="qaList">
  <h4 style="font-size:13px;color:#888;margin-bottom:8px">💡 常见问题</h4>
  {% for qa in faqs %}
  <div class="qa-item" onclick="askQuestion('{{ qa.q }}')">
    <div class="q">{{ qa.q }}</div>
    <div class="a">{{ qa.a }}</div>
  </div>
  {% endfor %}
</div>
<div class="input-area">
  <input id="msgInput" placeholder="输入您的问题..." onkeydown="if(event.key==='Enter')sendMsg()">
  <button onclick="sendMsg()">发送</button>
</div>
<script>
function sendMsg() {
  var input = document.getElementById('msgInput');
  var msg = input.value.trim();
  if (!msg) return;
  var chatArea = document.getElementById('chatArea');
  chatArea.innerHTML += '<div class="chat-bubble user">' + msg + '</div>';
  chatArea.innerHTML += '<div class="chat-bubble bot">感谢您的咨询！关于"' + msg + '"，我们的客服专员将尽快为您详细解答。您也可以拨打10086热线获取即时帮助。💚</div>';
  chatArea.scrollTop = chatArea.scrollHeight;
  input.value = '';
}
function askQuestion(q) {
  document.getElementById('msgInput').value = q;
  sendMsg();
}
</script>
</body>
</html>"""

# ── 产品数据 ───────────────────────────────────────────

PRODUCTS = [
    {
        "id": "5g-plan", "name": "5G智享套餐", "price": 128,
        "desc": "30GB流量 + 500分钟通话 + 100条短信",
        "long_desc": "面向5G时代的高速通信套餐，支持5G SA/NSA双模",
        "hot": True,
        "tags": [{"text": "5G", "style": "green"}, {"text": "热销", "style": "orange"}, {"text": "全国通用", "style": "blue"}],
        "details": [
            {"label": "国内流量", "value": "30GB/月"},
            {"label": "国内语音", "value": "500分钟/月"},
            {"label": "短信", "value": "100条/月"},
            {"label": "5G网络", "value": "支持"},
            {"label": "合约期", "value": "12个月"},
            {"label": "副卡", "value": "最多2张"},
        ]
    },
    {
        "id": "family-plan", "name": "和家庭融合套餐", "price": 198,
        "desc": "60GB共享 + 1000分钟 + 500M宽带 + IPTV",
        "long_desc": "一人付费全家享，宽带+电视+手机全搞定",
        "hot": True,
        "tags": [{"text": "家庭", "style": "green"}, {"text": "宽带", "style": "orange"}, {"text": "共享", "style": "blue"}],
        "details": [
            {"label": "共享流量", "value": "60GB/月"},
            {"label": "共享语音", "value": "1000分钟/月"},
            {"label": "宽带", "value": "500Mbps"},
            {"label": "IPTV", "value": "包含"},
            {"label": "共享人数", "value": "最多5人"},
            {"label": "合约期", "value": "24个月"},
        ]
    },
    {
        "id": "student-plan", "name": "动感地带校园版", "price": 38,
        "desc": "20GB校园流量 + 200分钟 + 视频免流",
        "long_desc": "专为学生群体打造的高性价比校园套餐",
        "hot": False,
        "tags": [{"text": "校园", "style": "green"}, {"text": "年轻", "style": "orange"}, {"text": "免流", "style": "blue"}],
        "details": [
            {"label": "校园流量", "value": "20GB/月"},
            {"label": "国内语音", "value": "200分钟/月"},
            {"label": "视频APP", "value": "免流观看"},
            {"label": "夜间流量", "value": "10GB"},
            {"label": "合约期", "value": "无"},
            {"label": "适用人群", "value": "在校学生"},
        ]
    },
    {
        "id": "elder-plan", "name": "神州行孝心卡", "price": 28,
        "desc": "语音畅聊 + 健康服务 + 防诈提醒 + 紧急呼叫",
        "long_desc": "为父母长辈量身定制的关怀通信方案",
        "hot": False,
        "tags": [{"text": "银发", "style": "green"}, {"text": "安全", "style": "orange"}, {"text": "健康", "style": "blue"}],
        "details": [
            {"label": "国内语音", "value": "300分钟/月"},
            {"label": "国内流量", "value": "3GB/月"},
            {"label": "健康监测", "value": "免费"},
            {"label": "防诈提醒", "value": "AI实时"},
            {"label": "合约期", "value": "无"},
            {"label": "适用人群", "value": "60岁以上"},
        ]
    },
    {
        "id": "business-plan", "name": "全球通商务版", "price": 388,
        "desc": "无限流量 + 2000分钟 + 国际漫游 + 云办公",
        "long_desc": "为商务人士打造的高端全能套餐",
        "hot": False,
        "tags": [{"text": "商务", "style": "green"}, {"text": "高端", "style": "orange"}, {"text": "国际", "style": "blue"}],
        "details": [
            {"label": "国内流量", "value": "不限量(100G后限速)"},
            {"label": "国内语音", "value": "2000分钟/月"},
            {"label": "国际漫游", "value": "50+国家"},
            {"label": "云存储", "value": "1TB"},
            {"label": "企业VPN", "value": "包含"},
            {"label": "合约期", "value": "12个月"},
        ]
    },
]


def log_interaction(event_type, data):
    """记录交互事件到JSONL文件"""
    entry = {
        "timestamp": time.time(),
        "event_type": event_type,
        **data
    }
    PAGE_VIEWS.append(entry)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


# ── 路由 ──────────────────────────────────────────────

@app.route("/")
def home():
    log_interaction("page_view", {"page": "home", "url": "/"})
    menu_items = [
        {"icon": "💰", "label": "查余额", "url": "/my-account"},
        {"icon": "📦", "label": "办套餐", "url": "/products"},
        {"icon": "🎁", "label": "领福利", "url": "/products"},
        {"icon": "📊", "label": "看账单", "url": "/my-account"},
        {"icon": "🌟", "label": "积分兑", "url": "/my-account"},
        {"icon": "📱", "label": "买手机", "url": "/products"},
        {"icon": "🏠", "label": "装宽带", "url": "/product/family-plan"},
        {"icon": "🌍", "label": "国际漫游", "url": "/product/business-plan"},
    ]
    recommendations = [
        {
            "name": "5G智享套餐", "tag": "热销",
            "desc": "30GB流量+500分钟+5G极速",
            "price": "¥128/月",
            "url": "/product/5g-plan"
        },
        {
            "name": "和家庭融合套餐", "tag": "推荐",
            "desc": "全家享，宽带电视手机三合一",
            "price": "¥198/月",
            "url": "/product/family-plan"
        },
        {
            "name": "动感地带校园版",
            "desc": "学生专享，视频免流超值",
            "price": "¥38/月",
            "url": "/product/student-plan"
        },
    ]
    html = render_template_string(
        HOME_PAGE,
        phone_tail="0000",
        balance="126.50",
        data_used="12.5",
        call_min="87",
        menu_items=menu_items,
        recommendations=recommendations
    )
    return html


@app.route("/products")
def products():
    log_interaction("page_view", {"page": "products", "url": "/products"})
    return render_template_string(PRODUCTS_PAGE, products=PRODUCTS)


@app.route("/product/<product_id>")
def product_detail(product_id):
    product = next((p for p in PRODUCTS if p["id"] == product_id), PRODUCTS[0])
    log_interaction("page_view", {"page": "product_detail", "product_id": product_id, "product_name": product["name"]})
    return render_template_string(PRODUCT_DETAIL_PAGE, product=product)


@app.route("/search")
def search():
    query = request.args.get("q", "")
    log_interaction("search", {"query": query, "url": f"/search?q={query}"})
    results = []
    if query:
        for p in PRODUCTS:
            if query.lower() in p["name"].lower() or query in p["desc"]:
                results.append({
                    "name": p["name"],
                    "desc": p["desc"],
                    "price": f"¥{p['price']}/月",
                    "url": f"/product/{p['id']}"
                })
        # 额外结果
        extra = [
            {"name": "移动产品资费大全", "desc": "查看所有套餐资费标准", "price": "查看详情", "url": "/products"},
            {"name": "5G终端优惠购", "desc": "办理5G套餐享购机优惠", "price": "最高减2000", "url": "/product/5g-plan"},
        ]
        results.extend(extra)
    return render_template_string(SEARCH_PAGE, query=query, results=results)


@app.route("/my-account")
def my_account():
    log_interaction("page_view", {"page": "my_account", "url": "/my-account"})
    orders = [
        {"icon": "📋", "label": "全部订单"},
        {"icon": "⏳", "label": "待生效"},
        {"icon": "✅", "label": "已完成"},
        {"icon": "❌", "label": "已取消"},
    ]
    services = [
        {"icon": "📊", "label": "账单查询", "url": "/my-account"},
        {"icon": "🔄", "label": "套餐变更", "url": "/products"},
        {"icon": "💳", "label": "充值缴费", "url": "/my-account"},
        {"icon": "📞", "label": "通话详单", "url": "/my-account"},
        {"icon": "🔐", "label": "安全设置", "url": "/my-account"},
    ]
    return render_template_string(MY_ACCOUNT_PAGE, orders=orders, services=services)


@app.route("/support")
def support():
    log_interaction("page_view", {"page": "support", "url": "/support"})
    faqs = [
        {"q": "如何查询我的套餐余量？", "a": "打开APP首页即可查看流量和通话剩余量。"},
        {"q": "移动产品资费有哪些？", "a": "包括动感地带、神州行、全球通等品牌，资费从18元到388元不等。"},
        {"q": "如何办理5G套餐？", "a": "前往产品中心选择5G套餐，点击立即办理即可。"},
        {"q": "携号转网如何办理？", "a": "发送短信CXXZ#姓名#身份证号到10086查询资格。"},
    ]
    return render_template_string(SUPPORT_PAGE, faqs=faqs)


@app.route("/api/log", methods=["POST"])
def api_log():
    data = request.get_json(force=True)
    log_interaction(data.get("event_type", "custom"), data.get("data", {}))
    return jsonify({"ok": True})


def start_server(port=5099):
    print(f"\n   🌐 模拟中国移动APP启动: http://localhost:{port}")
    app.run(host="127.0.0.1", port=port, debug=False, use_reloader=False)


if __name__ == "__main__":
    start_server()
