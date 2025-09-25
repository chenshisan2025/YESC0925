<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YesCoin Web3 宇宙 - UI預覽 V6.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bangers&family=Roboto+Condensed:wght@400;700&family=Noto+Sans+SC:wght@700&display=swap" rel="stylesheet">
    <style>
        /* --- 全局风格与设计语言 (V6.0 - 街头涂鸦主题) --- */
        :root {
            --bg-dark-brick: #282828;
            --text-light-gray: #EAEAEA;
            --card-bg-concrete: rgba(40, 40, 40, 0.8);
            --border-color: #EAEAEA;
            --cta-yellow-spray: #FFF500;
            --cta-pink-spray: #FF0077;
            --highlight-cyan-spray: #00FFFF;
        }

        body {
            background-color: var(--bg-dark-brick);
            color: var(--text-light-gray);
            font-family: 'Roboto Condensed', 'Noto Sans SC', sans-serif;
            background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23333333' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
            scroll-behavior: smooth;
        }

        /* 中文字体适配 */
        :lang(zh-CN) body, 
        :lang(zh-CN) .font-graffiti-title {
            font-family: 'Noto Sans SC', 'Roboto Condensed', sans-serif;
            font-weight: 700; /* 加粗以增强效果 */
        }
        .font-graffiti-title { 
            font-family: 'Bangers', cursive;
            /* 霓虹喷漆滴落风格 */
            background: linear-gradient(45deg, var(--cta-pink-spray), var(--cta-yellow-spray), var(--highlight-cyan-spray));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 
                0 0 5px rgba(255, 255, 255, 0.2), /* 柔和的白色辉光 */
                3px 3px 5px rgba(0,0,0,0.5); /* 深色立体阴影，模拟滴落感 */
        }
        
        /* 涂鸦按钮 */
        .graffiti-button {
            border: 3px solid var(--text-light-gray);
            transition: all 0.2s ease-in-out;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .graffiti-button:hover {
            transform: translateY(-3px) rotate(-2deg);
            box-shadow: 0px 8px 15px rgba(0,0,0,0.3);
        }
        
        /* 按钮配色 */
        .btn-yellow-spray { background-color: var(--cta-yellow-spray); color: var(--bg-dark-brick); border-color: var(--cta-yellow-spray); }
        .btn-pink-spray { background-color: var(--cta-pink-spray); color: var(--text-light-gray); border-color: var(--cta-pink-spray); }

        /* 导航链接交互 */
        .nav-link-graffiti-underline {
            position: relative;
            color: var(--text-light-gray);
        }
        .nav-link-graffiti-underline::after {
            content: ''; position: absolute; bottom: -8px; left: 0;
            width: 0; height: 4px;
            background-color: var(--cta-yellow-spray);
            transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .nav-link-graffiti-underline:hover::after { width: 100%; }

        /* 内容板块卡片 */
        .graffiti-card {
            background-color: var(--card-bg-concrete);
            border: 2px solid var(--border-color);
            backdrop-filter: blur(10px);
            transform: rotate(-1deg); /* Slight tilt for graffiti style */
        }
        .graffiti-card:hover {
            transform: rotate(1deg) scale(1.02);
            transition: transform 0.2s ease-in-out;
        }

        /* FAQ 折叠效果 */
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details .faq-icon { transition: transform 0.3s ease; }
        details[open] .faq-icon { transform: rotate(45deg); }
        
        /* 进度条 */
        .progress-bar {
            width: 100%; height: 24px; border: 2px solid var(--border-color); background-color: rgba(0,0,0,0.5); padding: 2px;
        }
        .progress-bar-inner {
            height: 100%; background-color: var(--highlight-cyan-spray);
        }

        /* 畫廊滾動條樣式 */
        .gallery-scrollbar::-webkit-scrollbar {
            height: 8px;
        }
        .gallery-scrollbar::-webkit-scrollbar-track {
            background: #444;
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb {
            background: var(--cta-yellow-spray);
        }
        .gallery-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: var(--cta-yellow-spray) #444;
        }
    </style>
</head>
<body class="min-h-screen text-lg">

    <header class="sticky top-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-sm p-4 border-b-2" style="border-color: var(--cta-yellow-spray);">
        <div class="container mx-auto flex justify-between items-center">
            <a href="#home" class="font-graffiti-title text-4xl tracking-widest">YesCoin</a>
            <nav class="hidden md:flex items-center space-x-8">
                <a href="#home" class="nav-link-graffiti-underline" data-lang-key="nav_home">首页</a>
                <a href="#token-info" class="nav-link-graffiti-underline" data-lang-key="nav_token">代币信息</a>
                <a href="#nft" class="nav-link-graffiti-underline" data-lang-key="nav_nft">NFT</a>
                <a href="#airdrop" class="nav-link-graffiti-underline" data-lang-key="nav_airdrop">空投</a>
                <a href="#faq" class="nav-link-graffiti-underline">FAQ</a>
            </nav>
            <div class="flex items-center space-x-2 md:space-x-4">
                <button id="lang-toggle" class="graffiti-button btn-pink-spray text-sm px-3 py-2">EN</button>
                <button class="graffiti-button btn-pink-spray text-sm px-4 py-2 hidden md:block" data-lang-key="nav_buy_yes">购买 YES</button>
                <button class="graffiti-button btn-yellow-spray text-sm px-4 py-2" data-lang-key="connect_wallet">连接钱包</button>
            </div>
        </div>
    </header>

    <main class="container mx-auto px-6 py-16 text-center">
        
        <section id="home" class="py-20 min-h-[70vh] flex flex-col justify-center items-center">
            <h1 class="font-graffiti-title text-7xl md:text-9xl text-shadow-lg" data-lang-key="hero_title">YesCoin</h1>
            <p class="text-2xl md:text-4xl mt-4 font-bold tracking-wider" data-lang-key="hero_subtitle">随时随地涂鸦起来，引爆你的迷因宇宙！</p>
            <a href="#airdrop" class="graffiti-button btn-yellow-spray font-graffiti-title text-2xl px-8 py-4 mt-8 inline-block" data-lang-key="hero_cta">立即炸场!</a>
        </section>

        <section id="stats" class="py-20">
            <h2 class="font-graffiti-title text-6xl mb-12" data-lang-key="stats_title">街头数据墙</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="graffiti-card p-6"><p class="font-graffiti-title text-5xl" style="color: var(--cta-pink-spray);" >12,345</p><p class="mt-2 font-bold" data-lang-key="stats_holders">持币地址</p></div>
                <div class="graffiti-card p-6"><p class="font-graffiti-title text-5xl" style="color: var(--cta-pink-spray);" >$1.2M</p><p class="mt-2 font-bold" data-lang-key="stats_market_cap">总市值</p></div>
                <div class="graffiti-card p-6"><p class="font-graffiti-title text-4xl" style="color: var(--cta-pink-spray);" >8,888 / 55315</p><p class="mt-2 font-bold" data-lang-key="stats_nft_minted">已铸造NFT</p></div>
                <div class="graffiti-card p-6"><p class="font-graffiti-title text-5xl" style="color: var(--cta-pink-spray);" >9,000+</p><p class="mt-2 font-bold" data-lang-key="stats_airdrop_participants">空投玩家</p></div>
            </div>
        </section>

        <section id="features" class="py-20">
            <h2 class="font-graffiti-title text-6xl mb-12" data-lang-key="features_title">我们的态度</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                <div class="text-center"><div class="text-7xl mb-4">📢</div><h3 class="font-graffiti-title text-4xl mb-2" data-lang-key="feature1_title">绝对公平</h3><p class="font-bold" data-lang-key="feature1_desc">无预售，无团队份额，人人平等。</p></div>
                <div class="text-center"><div class="text-7xl mb-4">💥</div><h3 class="font-graffiti-title text-4xl mb-2" data-lang-key="feature2_title">引爆文化</h3><p class="font-bold" data-lang-key="feature2_desc">我们不谈技术，我们创造潮流。</p></div>
                <div class="text-center"><div class="text-7xl mb-4">👾</div><h3 class="font-graffiti-title text-4xl mb-2" data-lang-key="feature3_title">自由万岁</h3><p class="font-bold" data-lang-key="feature3_desc">涂鸦是我们的语言， YES是我们的信仰。</p></div>
                <div class="text-center"><div class="text-7xl mb-4">🤘</div><h3 class="font-graffiti-title text-4xl mb-2" data-lang-key="feature4_title">社群为王</h3><p class="font-bold" data-lang-key="feature4_desc">你，才是这个计划的主宰。</p></div>
            </div>
        </section>

        <section id="roadmap" class="py-20">
            <h2 class="font-graffiti-title text-6xl mb-12" data-lang-key="roadmap_title">行动蓝图</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
                <div class="graffiti-card p-6"><h3 class="font-graffiti-title text-4xl mb-2" style="color: var(--cta-pink-spray);" data-lang-key="roadmap1_title">Phase 1 🚀</h3><p class="font-bold" data-lang-key="roadmap1_desc">发射！官网上线，空投开始，NFT 开铸。</p></div>
                <div class="graffiti-card p-6"><h3 class="font-graffiti-title text-4xl mb-2" style="color: var(--cta-pink-spray);" data-lang-key="roadmap2_title">Phase 2 📈</h3><p class="font-bold" data-lang-key="roadmap2_desc">占领！登陆 CMC/CG，社群扩张。</p></div>
                <div class="graffiti-card p-6"><h3 class="font-graffiti-title text-4xl mb-2" style="color: var(--cta-pink-spray);" data-lang-key="roadmap3_title">Phase 3 🎮</h3><p class="font-bold" data-lang-key="roadmap3_desc">开玩！NFT 交易市场启动，小游戏内测。</p></div>
                <div class="graffiti-card p-6"><h3 class="font-graffiti-title text-4xl mb-2" style="color: var(--cta-pink-spray);" data-lang-key="roadmap4_title">Phase 4 👑</h3><p class="font-bold" data-lang-key="roadmap4_desc">掌权！探索 DAO，社群自治。</p></div>
            </div>
        </section>

        <section id="team" class="py-20">
            <h2 class="font-graffiti-title text-6xl mb-4" data-lang-key="team_title">幕后主脑</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                <div class="text-center"><img src="https://placehold.co/150x150/282828/EAEAEA?text=Boss" alt="Team member" class="mx-auto mb-4 border-4 rounded-full" style="image-rendering: pixelated; border-color: var(--border-color)"><h3 class="font-graffiti-title text-3xl" data-lang-key="team_member1_name">教父 Yes</h3><p class="font-bold" data-lang-key="team_member1_role">发起人</p></div>
                <div class="text-center"><img src="https://placehold.co/150x150/282828/EAEAEA?text=Art" alt="Team member" class="mx-auto mb-4 border-4 rounded-full" style="image-rendering: pixelated; border-color: var(--border-color)"><h3 class="font-graffiti-title text-3xl" data-lang-key="team_member2_name">Pixel 骑士</h3><p class="font-bold" data-lang-key="team_member2_role">艺术总监</p></div>
                <div class="text-center"><img src="https://placehold.co/150x150/282828/EAEAEA?text=Dev" alt="Team member" class="mx-auto mb-4 border-4 rounded-full" style="image-rendering: pixelated; border-color: var(--border-color)"><h3 class="font-graffiti-title text-3xl" data-lang-key="team_member3_name">链上护卫</h3><p class="font-bold" data-lang-key="team_member3_role">合约开发</p></div>
                <div class="text-center"><img src="https://placehold.co/150x150/282828/EAEAEA?text=CM" alt="Team member" class="mx-auto mb-4 border-4 rounded-full" style="image-rendering: pixelated; border-color: var(--border-color)"><h3 class="font-graffiti-title text-3xl" data-lang-key="team_member4_name">社群领袖</h3><p class="font-bold" data-lang-key="team_member4_role">社群经理</p></div>
            </div>
        </section>
        
        <section id="token-info" class="py-20 text-center">
             <h2 class="font-graffiti-title text-6xl mb-12" data-lang-key="nav_token">代币信息</h2>
             <div class="graffiti-card p-8 max-w-5xl mx-auto text-left">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- 左侧：代币概览 -->
                    <div>
                        <h3 class="font-graffiti-title text-4xl mb-4" data-lang-key="token_overview">代币概览</h3>
                        <div class="space-y-2 font-bold">
                            <p><span data-lang-key="token_name">代币名称:</span> YesCoin</p>
                            <p><span data-lang-key="token_symbol">代币符号:</span> YES</p>
                            <p><span data-lang-key="token_chain">区块连:</span> BSC (币安智能链)</p>
                            <p><span data-lang-key="token_supply_label">总供应量:</span> 1,000,000,000,000,000</p>
                        </div>
                    </div>
                    <!-- 右侧：关键指标 -->
                    <div>
                        <h3 class="font-graffiti-title text-4xl mb-4" data-lang-key="token_metrics">关键市场指标</h3>
                        <div class="grid grid-cols-2 gap-4 font-bold">
                            <div class="graffiti-card p-4 -rotate-2"><p class="text-sm" data-lang-key="metric_price">当前价格</p><p class="font-graffiti-title text-3xl" style="color: var(--cta-yellow-spray);">$0.0007</p></div>
                            <div class="graffiti-card p-4 rotate-2"><p class="text-sm" data-lang-key="metric_market_cap">市值</p><p class="font-graffiti-title text-3xl" style="color: var(--cta-yellow-spray);">$58,453</p></div>
                            <div class="graffiti-card p-4 rotate-1"><p class="text-sm" data-lang-key="metric_holders">持有者数量</p><p class="font-graffiti-title text-3xl" style="color: var(--cta-yellow-spray);">12,087</p></div>
                            <div class="graffiti-card p-4 -rotate-1"><p class="text-sm" data-lang-key="metric_liquidity">流通供应量</p><p class="font-graffiti-title text-3xl" style="color: var(--cta-yellow-spray);">100B</p></div>
                        </div>
                    </div>
                </div>
                <div class="mt-8 pt-8 border-t-2 border-dashed border-gray-500 text-center">
                    <button class="graffiti-button btn-pink-spray font-graffiti-title text-xl px-6 py-3" data-lang-key="whitepaper_cta">查看白皮书</button>
                </div>
             </div>
        </section>
        
        <section id="nft" class="py-20">
            <h2 class="font-graffiti-title text-6xl mb-4" data-lang-key="nft_title">街头艺术 NFT</h2>
            <p class="max-w-3xl mx-auto mb-12 font-bold" data-lang-key="nft_subtitle">每一件作品都是独一无二的街头宣言。这不仅是收藏品，这是你的帮派符号。</p>
            
            <!-- NFT Gallery Start -->
            <div class="relative max-w-5xl mx-auto">
                <div id="gallery-container" class="flex overflow-x-auto snap-x snap-mandatory space-x-4 pb-4 gallery-scrollbar">
                    <!-- Gallery Item 1 -->
                    <div class="snap-center flex-shrink-0 w-4/5 md:w-1/2 lg:w-1/3">
                        <div class="graffiti-card p-4">
                            
                            <p class="font-bold mt-2">水泥墙系列 #1</p>
                        </div>
                    </div>
                    <!-- Gallery Item 2 -->
                    <div class="snap-center flex-shrink-0 w-4/5 md:w-1/2 lg:w-1/3">
                        <div class="graffiti-card p-4">
                            
                            <p class="font-bold mt-2">红砖墙系列 #1</p>
                        </div>
                    </div>
                    <!-- Gallery Item 3 -->
                    <div class="snap-center flex-shrink-0 w-4/5 md:w-1/2 lg:w-1/3">
                        <div class="graffiti-card p-4">
                            
                            <p class="font-bold mt-2">纸板系列 #2</p>
                        </div>
                    </div>
                    <!-- Gallery Item 4 -->
                    <div class="snap-center flex-shrink-0 w-4/5 md:w-1/2 lg:w-1/3">
                        <div class="graffiti-card p-4">
                            
                            <p class="font-bold mt-2">木板系列 #1</p>
                        </div>
                    </div>
                    <!-- Gallery Item 5 -->
                     <div class="snap-center flex-shrink-0 w-4/5 md:w-1/2 lg:w-1/3">
                        <div class="graffiti-card p-4">
                            
                             <p class="font-bold mt-2">金属板系列 #2</p>
                        </div>
                    </div>
                    <!-- Gallery Item 6 -->
                    <div class="snap-center flex-shrink-0 w-4/5 md:w-1/2 lg:w-1/3">
                        <div class="graffiti-card p-4">
                            
                            <p class="font-bold mt-2">牛皮纸系列 #2</p>
                        </div>
                    </div>
                </div>
                <!-- Navigation Buttons -->
                <button id="scroll-left" class="absolute top-1/2 left-0 -translate-y-1/2 bg-black/50 text-white p-2 text-2xl font-bold rounded-r-lg">‹</button>
                <button id="scroll-right" class="absolute top-1/2 right-0 -translate-y-1/2 bg-black/50 text-white p-2 text-2xl font-bold rounded-l-lg">›</button>
            </div>
            <!-- NFT Gallery End -->

            <div class="graffiti-card p-8 max-w-2xl mx-auto mt-12">
                <p class="font-graffiti-title text-2xl mb-2" data-lang-key="nft_mint_progress">铸造进度: 8,888 / 55,315</p>
                <div class="progress-bar mb-6"><div class="progress-bar-inner" style="width: 16%;"></div></div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div class="text-left space-y-4">
                        <div><label class="font-graffiti-title text-2xl block mb-2" data-lang-key="nft_price">价格</label><p class="text-4xl font-graffiti-title" style="color: var(--cta-pink-spray);">0.05 BNB</p></div>
                        <div><label for="mint-amount" class="font-graffiti-title text-2xl block mb-2" data-lang-key="nft_amount">数量</label><input type="number" id="mint-amount" value="1" min="1" max="100" class="w-full p-2 text-center bg-transparent border-2 font-graffiti-title text-2xl" style="border-color: var(--border-color);"></div>
                    </div>
                    <button class="graffiti-button btn-yellow-spray w-full py-3 font-graffiti-title text-4xl" data-lang-key="nft_mint_now">铸造</button>
                </div>
                 <div class="mt-8 text-left p-4 border-t-2 border-dashed" style="border-color: var(--cta-pink-spray);">
                    <h3 class="font-graffiti-title text-3xl mb-2" data-lang-key="nft_invite_title">拉兄弟入伙 🤘</h3>
                    <p class="font-bold" data-lang-key="nft_invite_desc">用你的专属链接，朋友每铸造一个NFT，你就获得1000万 YES 代币奖励！</p>
                    <div class="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <div class="bg-black/20 border-2 border-dashed border-gray-500 p-2 text-sm text-gray-300 truncate w-full sm:w-auto">
                            https://yescoin.xyz/?ref=0x123...
                        </div>
                        <button class="graffiti-button btn-pink-spray text-sm px-4 py-2 w-full sm:w-auto" data-lang-key="nft_invite_copy_btn">复制</button>
                    </div>
                </div>
            </div>
        </section>

        <section id="airdrop" class="py-20">
            <h2 class="font-graffiti-title text-6xl mb-4" data-lang-key="airdrop_title">空投</h2>
            <p class="max-w-3xl mx-auto mb-12 font-bold" data-lang-key="airdrop_subtitle">完成任务，领取你的第一笔启动资金。</p>
            <div class="graffiti-card p-8 max-w-2xl mx-auto text-left">
                <h3 class="font-graffiti-title text-4xl mb-6 text-center" data-lang-key="airdrop_tasks_title">任务清单</h3>
                <ul class="space-y-4 mb-8 font-bold">
                    <li class="flex justify-between items-center"><span data-lang-key="airdrop_task1">1. 关注 Twitter</span><button class="graffiti-button btn-pink-spray text-sm px-3 py-1">@YesCoin</button></li>
                    <li class="flex justify-between items-center"><span data-lang-key="airdrop_task2">2. 转发推文</span><button class="graffiti-button btn-pink-spray text-sm px-3 py-1" data-lang-key="airdrop_view_tweet">查看</button></li>
                    <li class="flex justify-between items-center"><span data-lang-key="airdrop_task3">3. 加入Telegram</span><button class="graffiti-button btn-pink-spray text-sm px-3 py-1" data-lang-key="airdrop_join_tg">加入</button></li>
                </ul>
                <button class="graffiti-button btn-yellow-spray w-full py-3 font-graffiti-title text-2xl" data-lang-key="airdrop_claim">领取 1000万 YES!</button>
            </div>
        </section>
        
        <section id="faq" class="py-20 text-left">
            <h2 class="font-graffiti-title text-6xl mb-12 text-center" data-lang-key="faq_title">黑话问答</h2>
            <div class="max-w-4xl mx-auto space-y-4">
                <details class="graffiti-card p-4 cursor-pointer"><summary class="font-graffiti-title text-3xl list-none flex justify-between items-center"><span data-lang-key="faq1_q">这到底是啥？</span><span class="text-4xl faq-icon" style="color: var(--cta-pink-spray);">+</span></summary><p class="mt-4 pt-4 border-t-2 border-dashed font-bold" style="border-color: var(--cta-pink-spray);" data-lang-key="faq1_a">一个社群驱动的迷因项目。好玩就对了，价值来自于我们所有人。</p></details>
                <details class="graffiti-card p-4 cursor-pointer"><summary class="font-graffiti-title text-3xl list-none flex justify-between items-center"><span data-lang-key="faq2_q">怎么买？</span><span class="text-4xl faq-icon" style="color: var(--cta-pink-spray);">+</span></summary><p class="mt-4 pt-4 border-t-2 border-dashed font-bold" style="border-color: var(--cta-pink-spray);" data-lang-key="faq2_a">点击“购买 YES”按钮，去 PancakeSwap。认准官方合约地址，别买错了。</p></details>
                <details class="graffiti-card p-4 cursor-pointer"><summary class="font-graffiti-title text-3xl list-none flex justify-between items-center"><span data-lang-key="faq3_q">NFT 有啥用？</span><span class="text-4xl faq-icon" style="color: var(--cta-pink-spray);">+</span></summary><p class="mt-4 pt-4 border-t-2 border-dashed font-bold" style="border-color: var(--cta-pink-spray);" data-lang-key="faq3_a">除了帅，还是早期成员的身份象征。未来可能有特殊权益。</p></details>
                <details class="graffiti-card p-4 cursor-pointer"><summary class="font-graffiti-title text-3xl list-none flex justify-between items-center"><span data-lang-key="faq4_q">安全吗？</span><span class="text-4xl faq-icon" style="color: var(--cta-pink-spray);">+</span></summary><p class="mt-4 pt-4 border-t-2 border-dashed font-bold" style="border-color: var(--cta-pink-spray);" data-lang-key="faq4_a">流动性已锁定，团队不持有代币。但投资有风险，自己做主。</p></details>
            </div>
        </section>

        <section id="final-cta" class="py-20">
             <div class="graffiti-card p-10"><h2 class="font-graffiti-title text-5xl mb-6" data-lang-key="final_cta_title">我们的未来，自己画。</h2>
                 <div class="flex flex-col md:flex-row justify-center items-center gap-6">
                     <a href="#airdrop" class="graffiti-button btn-yellow-spray font-graffiti-title text-xl px-6 py-3 w-full md:w-auto" data-lang-key="final_cta_airdrop">领取空投 →</a>
                     <button class="graffiti-button btn-pink-spray font-graffiti-title text-xl px-6 py-3 w-full md:w-auto" data-lang-key="final_cta_buy">去 PancakeSwap 购买 →</button>
                 </div>
             </div>
        </section>
    </main>

    <footer class="py-8 border-t-2" style="border-color: var(--cta-yellow-spray);">
        <div class="container mx-auto text-center">
            <div class="flex justify-center space-x-6 mb-4">
                <a href="#" class="text-3xl hover:text-pink-500">
                    <svg class="w-8 h-8 fill-current" viewBox="0 0 16 16">
                        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.602.75Zm-1.282 13.025h1.42L4.19 2.105H2.63l8.69 11.67Z"/>
                    </svg>
                </a>
                <a href="#" class="text-3xl hover:text-pink-500">Telegram</a>
            </div>
            <p class="font-bold" data-lang-key="footer_copy">© 2025 YesCoin Community</p>
        </div>
    </footer>

    <script>
        // --- 语言切换功能 ---
        const translations = {
            "zh": {
                "nav_home": "首页", "nav_token": "代币", "nav_nft": "NFT", "nav_airdrop": "空投", "nav_buy_yes": "购买 YES", "connect_wallet": "连接钱包",
                "hero_title": "YesCoin", "hero_subtitle": "随时随地涂鸦起来，引爆你的迷因宇宙！", "hero_cta": "立即炸场!",
                "stats_title": "街头数据墙", "stats_holders": "持币地址", "stats_market_cap": "总市值", "stats_nft_minted": "已铸造NFT", "stats_airdrop_participants": "空投玩家",
                "features_title": "我们的态度","feature1_title": "绝对公平", "feature1_desc": "无预售，无团队份额，人人平等。", "feature2_title": "引爆文化", "feature2_desc": "我们不谈技术，我们创造潮流。", "feature3_title": "自由万岁", "feature3_desc": "涂鸦是我们的语言， YES是我们的信仰。", "feature4_title": "社群为王", "feature4_desc": "你，才是这个计划的主宰。",
                "roadmap_title": "行动蓝图", "roadmap1_title": "Phase 1 🚀", "roadmap1_desc": "发射！官网上线，空投开始，NFT 开铸。", "roadmap2_title": "Phase 2 📈", "roadmap2_desc": "占领！登陆 CMC/CG，社群扩张。", "roadmap3_title": "Phase 3 🎮", "roadmap3_desc": "开玩！NFT 交易市场启动，小游戏内测。", "roadmap4_title": "Phase 4 👑", "roadmap4_desc": "掌权！探索 DAO，社群自治。",
                "team_title": "幕后主脑","team_member1_name": "教父 Yes", "team_member1_role": "发起人", "team_member2_name": "Pixel 骑士", "team_member2_role": "艺术总监", "team_member3_name": "链上护卫", "team_member3_role": "合约开发", "team_member4_name": "社群领袖", "team_member4_role": "社群经理",
                "whitepaper_cta": "查看白皮书", 
                "token_overview": "代币概览", "token_name": "代币名称:", "token_symbol": "代币符号:", "token_chain": "区块连:", "token_supply_label": "总供应量:",
                "token_metrics": "关键市场指标", "metric_price": "当前价格", "metric_market_cap": "市值", "metric_holders": "持有者数量", "metric_liquidity": "流通供应量",
                "nft_title": "街头艺术 NFT", "nft_subtitle": "每一件作品都是独一无二的街头宣言。这不仅是收藏品，这是你的帮派符号。", "nft_mint_progress": "铸造进度: 8,888 / 55,315", "nft_price": "价格", "nft_amount": "数量", "nft_mint_now": "铸造", "nft_invite_title": "拉兄弟入伙 🤘", "nft_invite_desc": "用你的专属链接，朋友每铸造一个NFT，你就获得1000万 YES 代币奖励！", "nft_invite_copy_btn": "复制",
                "airdrop_title": "空投", "airdrop_subtitle": "完成任务，领取你的第一笔启动资金。", "airdrop_tasks_title": "任务清单", "airdrop_task1": "1. 关注 Twitter", "airdrop_task2": "2. 转发推文", "airdrop_task3": "3. 加入Telegram", "airdrop_view_tweet": "查看", "airdrop_join_tg": "加入", "airdrop_claim": "领取 1000万 YES!",
                "faq_title": "黑话问答", "faq1_q": "这到底是啥？", "faq1_a": "一个社群驱动的迷因项目。好玩就对了，价值来自于我们所有人。", "faq2_q": "怎么买？", "faq2_a": "点击“购买 YES”按钮，去 PancakeSwap。认准官方合约地址，别买错了。", "faq3_q": "NFT 有啥用？", "faq3_a": "除了帅，还是早期成员的身份象征。未来可能有特殊权益。", "faq4_q": "安全吗？", "faq4_a": "流动性已锁定，团队不持有代币。但投资有风险，自己做主。",
                "final_cta_title": "我们的未来，自己画。", "final_cta_airdrop": "领取空投 →", "final_cta_buy": "去 PancakeSwap 购买 →", "footer_copy": "© 2025 YesCoin Community"
            },
            "en": {
                "nav_home": "Home", "nav_token": "Token", "nav_nft": "NFT", "nav_airdrop": "Airdrop", "nav_buy_yes": "Buy YES", "connect_wallet": "Connect Wallet",
                "hero_title": "YesCoin", "hero_subtitle": "Doodle anywhere, anytime, and detonate your meme universe!", "hero_cta": "Bomb The Scene!",
                "stats_title": "Street Data Wall", "stats_holders": "Holders", "stats_market_cap": "Market Cap", "stats_nft_minted": "NFTs Minted", "stats_airdrop_participants": "Airdrop Players",
                "features_title": "Our Attitude","feature1_title": "Absolute Fairness", "feature1_desc": "No presale, no team tokens. Everyone's equal.", "feature2_title": "Culture Bomb", "feature2_desc": "We don't talk tech, we create trends.", "feature3_title": "Long Live Freedom", "feature3_desc": "Graffiti is our language, YES is our creed.", "feature4_title": "Community is King", "feature4_desc": "You are the master of this project.",
                "roadmap_title": "Action Blueprint", "roadmap1_title": "Phase 1 🚀", "roadmap1_desc": "Launch! Website live, airdrop starts, NFT minting opens.", "roadmap2_title": "Phase 2 📈", "roadmap2_desc": "Conquer! List on CMC/CG, community expansion.", "roadmap3_title": "Phase 3 🎮", "roadmap3_desc": "Game On! NFT marketplace live, mini-game beta test.", "roadmap4_title": "Phase 4 👑", "roadmap4_desc": "Reign! Explore DAO, community governance.",
                "team_title": "The Masterminds","team_member1_name": "Godfather Yes", "team_member1_role": "Initiator", "team_member2_name": "Sir Pixel", "team_member2_role": "Art Director", "team_member3_name": "Chain Guardian", "team_member3_role": "Contract Dev", "team_member4_name": "Community Leader", "team_member4_role": "Community Manager",
                "whitepaper_cta": "Read Whitepaper",
                "token_overview": "Token Overview", "token_name": "Name:", "token_symbol": "Symbol:", "token_chain": "Chain:", "token_supply_label": "Total Supply:",
                "token_metrics": "Key Market Metrics", "metric_price": "Current Price", "metric_market_cap": "Market Cap", "metric_holders": "Holders", "metric_liquidity": "Circulating Supply",
                "nft_title": "Street Art NFTs", "nft_subtitle": "Each piece is a unique street statement. This ain't just a collectible, it's your crew's symbol.", "nft_mint_progress": "Mint Progress: 8,888 / 55,315", "nft_price": "Price", "nft_amount": "Amount", "nft_mint_now": "Mint", "nft_invite_title": "Get Your Crew In 🤘", "nft_invite_desc": "Use your exclusive link, for every NFT your friend mints, you get a 10,000,000 YES token reward!", "nft_invite_copy_btn": "Copy",
                "airdrop_title": "Airdrop", "airdrop_subtitle": "Complete missions, get your startup capital.", "airdrop_tasks_title": "Task List", "airdrop_task1": "1. Follow Twitter", "airdrop_task2": "2. Retweet Post", "airdrop_task3": "3. Join Telegram", "airdrop_view_tweet": "View", "airdrop_join_tg": "Join", "airdrop_claim": "Claim 10M YES!",
                "faq_title": "Street Q&A", "faq1_q": "What is this?", "faq1_a": "A community-driven meme project. It's for fun. Value comes from all of us.", "faq2_q": "How to buy?", "faq2_a": "Click 'Buy YES', go to PancakeSwap. Check the official contract address, don't buy fakes.", "faq3_q": "What's the NFT for?", "faq3_a": "Besides looking cool, it's a symbol for early members. Might have special perks later.", "faq4_q": "Is it safe?", "faq4_a": "Liquidity is locked, the team holds no tokens. But crypto is risky, DYOR.",
                "final_cta_title": "We paint our own future.", "final_cta_airdrop": "Get Airdrop →", "final_cta_buy": "Buy on PancakeSwap →", "footer_copy": "© 2025 YesCoin Community"
            }
        };

        // --- 语言切换功能 ---
        const langToggle = document.getElementById('lang-toggle');
        const htmlEl = document.documentElement;

        function setLanguage(lang) {
            htmlEl.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');
            document.querySelectorAll('[data-lang-key]').forEach(el => {
                const key = el.getAttribute('data-lang-key');
                if (translations[lang] && translations[lang][key]) {
                    el.innerHTML = translations[lang][key];
                }
            });
            langToggle.innerText = lang === 'en' ? '中文' : 'EN';
        }

        langToggle.addEventListener('click', () => {
            const currentLang = htmlEl.getAttribute('lang') === 'en' ? 'zh' : 'en';
            setLanguage(currentLang);
            localStorage.setItem('yescoin-lang', currentLang);
        });

        const savedLang = localStorage.getItem('yescoin-lang') || 'zh';
        setLanguage(savedLang);

        // --- 畫廊滾動功能 ---
        const galleryContainer = document.getElementById('gallery-container');
        const scrollLeftBtn = document.getElementById('scroll-left');
        const scrollRightBtn = document.getElementById('scroll-right');

        scrollLeftBtn.addEventListener('click', () => {
            const scrollAmount = galleryContainer.offsetWidth * 0.8; // 每次滾動80%寬度
            galleryContainer.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        scrollRightBtn.addEventListener('click', () => {
            const scrollAmount = galleryContainer.offsetWidth * 0.8;
            galleryContainer.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });

    </script>
</body>
</html>


