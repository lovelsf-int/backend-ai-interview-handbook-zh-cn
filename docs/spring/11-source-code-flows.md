---
title: Spring 核心源码调用链
description: refresh、getBean、doCreateBean、AOP、事务、MVC 与 Boot 源码阅读地图
status: reviewing
baseline: Spring Framework core architecture and Spring Boot application model
last_verified: 2026-09-04
level: P7/P8
source: Spring 官方参考文档、核心源码与资深 Java 面试整理
---

# Spring 核心源码调用链

## 阅读方法

源码面试不是背类名竞赛。每条链都回答四个问题：入口是什么、状态保存在哪里、扩展点何时执行、最终产物是什么。先读模板方法和主干，再进入具体实现。

## 容器刷新链

```text
AbstractApplicationContext.refresh
  -> prepareRefresh
  -> obtainFreshBeanFactory
  -> prepareBeanFactory
  -> invokeBeanFactoryPostProcessors
  -> registerBeanPostProcessors
  -> initApplicationEventMulticaster
  -> registerListeners
  -> finishBeanFactoryInitialization
  -> finishRefresh
```

重点观察：异常时如何销毁已创建单例、如何重置 active 状态、后置处理器为何在普通 Bean 前注册。

## Bean 获取与创建链

```text
AbstractBeanFactory.getBean
  -> doGetBean
     -> getSingleton(beanName)
     -> getMergedLocalBeanDefinition
     -> createBean
        -> resolveBeforeInstantiation
        -> doCreateBean
           -> createBeanInstance
           -> applyMergedBeanDefinitionPostProcessors
           -> addSingletonFactory
           -> populateBean
           -> initializeBean
           -> registerDisposableBeanIfNecessary
```

`resolveBeforeInstantiation` 允许后置处理器在常规实例化前直接返回代理；大多数普通自动代理发生在初始化后。

## 依赖注入链

```text
AutowiredAnnotationBeanPostProcessor
  -> postProcessProperties
  -> InjectionMetadata.inject
  -> resolveDependency
  -> doResolveDependency
  -> findAutowireCandidates
  -> determineAutowireCandidate
```

调试多实现冲突时重点看候选集合、qualifier、primary 和依赖描述符，而不是只看异常最外层。

## 循环依赖与单例链

```text
DefaultSingletonBeanRegistry.getSingleton
  -> singletonObjects
  -> earlySingletonObjects
  -> singletonFactories.get(...).getObject()
  -> earlySingletonObjects.put(...)
```

创建中标记、提前工厂、最终注册和异常清理共同保证单例状态机，不是三个 Map 独立工作。

## AOP 代理链

```text
AbstractAutoProxyCreator.postProcessAfterInitialization
  -> wrapIfNecessary
  -> getAdvicesAndAdvisorsForBean
  -> createProxy
  -> ProxyFactory.getProxy
  -> JDK/CGLIB invocation
  -> getInterceptorsAndDynamicInterceptionAdvice
  -> ReflectiveMethodInvocation.proceed
```

阅读 `proceed()` 时要理解索引递增形成责任链，最终才反射调用目标方法。

## 事务链

```text
TransactionInterceptor.invoke
  -> invokeWithinTransaction
  -> createTransactionIfNecessary
  -> PlatformTransactionManager.getTransaction
  -> invocation.proceedWithInvocation
  -> completeTransactionAfterThrowing / commitTransactionAfterReturning
```

具体 JDBC 事务再进入事务管理器获取连接、绑定资源、设置自动提交和隔离级别。代理层与资源层要分开解释。

## MVC 链

```text
FrameworkServlet.processRequest
  -> DispatcherServlet.doService
  -> doDispatch
  -> getHandler
  -> getHandlerAdapter
  -> HandlerAdapter.handle
  -> invokeHandlerMethod
  -> argumentResolvers / returnValueHandlers
  -> processDispatchResult
```

异常路径和正常返回路径最终都可能进入结果处理，不要只读 Controller 调用。

## Boot 启动链

```text
SpringApplication.run
  -> prepareEnvironment
  -> createApplicationContext
  -> prepareContext
  -> refreshContext
  -> callRunners
```

自动配置重点追踪配置类解析、AutoConfiguration 导入候选、条件评估与 BeanDefinition 注册，而不是把 Starter 当成运行期组件。

## 源码题回答模板

> 以事务为例，入口是代理的 TransactionInterceptor.invoke，核心模板在 invokeWithinTransaction。它先通过 TransactionAttributeSource 读取方法和类上的事务元数据，再选择 TransactionManager 获取或创建事务；随后执行拦截器链中的目标方法，按异常回滚规则提交或回滚。事务资源通常通过同步管理器绑定到当前线程，所以自调用没有进入拦截器、异步线程没有原上下文时都会失效。生产上我会再结合连接池、事务时长和外部副作用说明边界。

## 调试技巧

- 在定义注册、Bean 创建、后置处理和代理调用的关键入口设置条件断点。
- 打印 BeanDefinition 来源、运行期 Bean 类型和 Advisor，而不是只打印类名。
- 对启动卡顿使用线程转储和启动阶段指标，不要在每个 Spring 方法打断点。
- 对版本差异以当前依赖源码为准，避免背某个旧版本内部字段后强行套用。
