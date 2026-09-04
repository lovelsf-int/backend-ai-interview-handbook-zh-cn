from pathlib import Path
import re

repo = Path('.')

config_path = repo / 'docs/.vitepress/config.mts'
config = config_path.read_text(encoding='utf-8')
spring_sidebar = """const springSidebar = [
  { text: '专题首页', link: '/spring/' },
  { text: '01 核心架构', link: '/spring/01-core-architecture.md' },
  { text: '02 IoC、DI 与容器', link: '/spring/02-ioc-di-container.md' },
  { text: '03 Bean 生命周期', link: '/spring/03-bean-lifecycle-extension-points.md' },
  { text: '04 注入与循环依赖', link: '/spring/04-dependency-injection-circular-reference.md' },
  { text: '05 AOP 与代理', link: '/spring/05-aop-proxy-interceptor.md' },
  { text: '06 声明式事务', link: '/spring/06-transaction-principles.md' },
  { text: '07 Spring MVC', link: '/spring/07-spring-mvc-request-flow.md' },
  { text: '08 Boot 与自动配置', link: '/spring/08-spring-boot-startup-auto-configuration.md' },
  { text: '09 事件、缓存与异步', link: '/spring/09-annotations-events-cache-async.md' },
  { text: '10 作用域与线程安全', link: '/spring/10-scope-thread-safety.md' },
  { text: '11 核心源码链路', link: '/spring/11-source-code-flows.md' },
  { text: '12 生产故障排查', link: '/spring/12-production-troubleshooting.md' },
  { text: '13 100 道核心面试题', link: '/spring/13-interview-question-bank.md' }
]

"""
if 'const springSidebar' not in config:
    config = config.replace('const kafkaSidebar = [', spring_sidebar + 'const kafkaSidebar = [', 1)
if "{ text: 'Spring', link: '/spring/' }" not in config:
    config = config.replace("          { text: 'JVM', link: '/jvm/' },", "          { text: 'JVM', link: '/jvm/' },\n          { text: 'Spring', link: '/spring/' },", 1)
if "'/spring/': springSidebar" not in config:
    config = config.replace("      '/jvm/': [", "      '/spring/': springSidebar,\n      '/jvm/': [", 1)
if "{ text: 'Spring 核心面试', link: '/spring/' }" not in config:
    config = config.replace("        { text: '设计模式生产场景', link: '/java/design-patterns-production-scenarios.md' },", "        { text: '设计模式生产场景', link: '/java/design-patterns-production-scenarios.md' },\n        { text: 'Spring 核心面试', link: '/spring/' },", 1)
config_path.write_text(config, encoding='utf-8')

home_path = repo / 'docs/index.md'
home = home_path.read_text(encoding='utf-8')
home = home.replace('Java · JVM · MySQL · Kafka · Redis · Elasticsearch · AI Agent · 金融支付', 'Java · JVM · Spring · MySQL · Kafka · Redis · Elasticsearch · AI Agent · 金融支付')
home = home.replace('Java、JVM、MySQL、Kafka、Redis 与 Elasticsearch 的原理、调优和故障排查。', 'Java、JVM、Spring、MySQL、Kafka、Redis 与 Elasticsearch 的原理、调优和故障排查。')
if 'link: /spring/' not in home:
    home = home.replace('    - theme: alt\n      text: 查看 GitHub', '    - theme: alt\n      text: Spring 核心面试\n      link: /spring/\n    - theme: alt\n      text: 查看 GitHub')
home_path.write_text(home, encoding='utf-8')

lp_path = repo / 'docs/guide/learning-path.md'
lp = lp_path.read_text(encoding='utf-8')
lp = lp.replace('先掌握 Java 并发、JVM 排障、MySQL 事务与锁、Kafka 可靠性、Redis 缓存一致性和 Elasticsearch 读写链路。', '先掌握 Java 并发、JVM 排障、Spring IoC/AOP/事务、MySQL 事务与锁、Kafka 可靠性、Redis 缓存一致性和 Elasticsearch 读写链路。')
if '../spring/' not in lp:
    lp = lp.replace('目标是能够在 90 秒内给出有边界的核心回答。', '目标是能够在 90 秒内给出有边界的核心回答。Spring 部分按 [核心架构与 IoC 主线](../spring/) 复习，再进入事务和生产排障。')
lp_path.write_text(lp, encoding='utf-8')

java_index_path = repo / 'docs/java/index.md'
java_index = java_index_path.read_text(encoding='utf-8')
if '[Spring 核心原理与面试手册](../spring/)' not in java_index:
    java_index = java_index.replace('5. [Spring 事务与服务治理](./spring-transactions-service-governance.md)', '5. [Spring 核心原理与面试手册](../spring/)\n6. [Spring 事务与服务治理（兼容入口）](./spring-transactions-service-governance.md)')
    java_index = java_index.replace('6. [JVM 诊断与 GC]', '7. [JVM 诊断与 GC]')
    java_index = java_index.replace('7. [MySQL 事务、锁与索引]', '8. [MySQL 事务、锁与索引]')
    java_index = java_index.replace('8. [Java 设计模式的生产场景与边界]', '9. [Java 设计模式的生产场景与边界]')
java_index_path.write_text(java_index, encoding='utf-8')

legacy_path = repo / 'docs/java/spring-transactions-service-governance.md'
legacy = legacy_path.read_text(encoding='utf-8')
canonical = '> 本页保留原有服务治理场景作为兼容入口。Spring 事务机制的 canonical 版本请阅读 [Spring 声明式事务原理](../spring/06-transaction-principles.md)，完整专题入口见 [Spring 核心面试手册](../spring/)。\n\n'
if '../spring/06-transaction-principles.md' not in legacy:
    legacy = legacy.replace('# Spring 事务与服务治理\n\n', '# Spring 事务与服务治理\n\n' + canonical, 1)
legacy_path.write_text(legacy, encoding='utf-8')

readme_path = repo / 'README.md'
readme = readme_path.read_text(encoding='utf-8')
readme = readme.replace('- Java、JVM、Spring、MySQL 与系统设计', '- Java、JVM、独立 Spring 核心面试、MySQL 与系统设计')
readme = re.sub(r'当前包含 12 份自有源资料迁移形成的 90 余个正文页面。', '当前包含 12 份自有源资料迁移与持续整理形成的 100 余个正文页面。', readme)
readme_path.write_text(readme, encoding='utf-8')

changelog_path = repo / 'CHANGELOG.md'
changelog = changelog_path.read_text(encoding='utf-8')
section = """## 2026-09-04

- 新增独立 Spring P7/P8 核心面试模块，覆盖架构、IoC、Bean 生命周期、循环依赖、AOP、事务、MVC、Boot、事件缓存异步、线程安全、源码与生产排障。
- 新增 Spring 100 道速记题库，并为每章配置顶部导航、专题侧栏、首页、学习路线和 Java 专题入口。
- 保留旧 Spring 事务治理页面作为兼容入口，canonical 内容迁移到独立事务章节。
- 增加 Spring 模块验收测试，验证完整页面集合、导航可达性、兼容链接和题库数量。

"""
if '## 2026-09-04' not in changelog:
    changelog = changelog.replace('# 变更日志\n\n', '# 变更日志\n\n' + section, 1)
changelog_path.write_text(changelog, encoding='utf-8')

expected = [
    'index.md', '01-core-architecture.md', '02-ioc-di-container.md',
    '03-bean-lifecycle-extension-points.md', '04-dependency-injection-circular-reference.md',
    '05-aop-proxy-interceptor.md', '06-transaction-principles.md',
    '07-spring-mvc-request-flow.md', '08-spring-boot-startup-auto-configuration.md',
    '09-annotations-events-cache-async.md', '10-scope-thread-safety.md',
    '11-source-code-flows.md', '12-production-troubleshooting.md',
    '13-interview-question-bank.md'
]
missing = [name for name in expected if not (repo / 'docs/spring' / name).exists()]
if missing:
    raise SystemExit(f'missing Spring pages: {missing}')
