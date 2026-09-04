---
title: Spring 核心源码调用链
description: refresh、getBean、Bean 实例化分支、AOP、事务、MVC 与 Boot 源码阅读地图
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

## Bean 实例化分支

`AbstractAutowireCapableBeanFactory.createBeanInstance()` 并不是只调用无参构造器。它会根据 BeanDefinition 中保存的信息选择不同创建路径：

```text
createBeanInstance
  -> resolveBeanClass
  -> BeanDefinition 存在 instanceSupplier
       -> obtainFromSupplier
  -> BeanDefinition 存在 factoryMethodName
       -> instantiateUsingFactoryMethod
  -> 后置处理器给出候选构造器
       -> determineConstructorsFromBeanPostProcessors
  -> 需要构造器装配或显式构造参数
       -> autowireConstructor
  -> 存在 preferred constructors
       -> autowireConstructor
  -> 默认分支
       -> instantiateBean
```

其中：

- `obtainFromSupplier()` 处理 `GenericApplicationContext.registerBean(..., Supplier)` 等函数式注册。
- `instantiateUsingFactoryMethod()` 同时覆盖静态工厂方法、实例工厂方法和配置类中的 `@Bean` 方法。
- `autowireConstructor()` 由 `ConstructorResolver` 解析参数并选择构造器。
- `instantiateBean()` 通常通过 `InstantiationStrategy` 调用默认构造器。

面试时应说明，组件扫描和 XML 属于“BeanDefinition 从哪里来”，而构造器、工厂方法和 Supplier 属于“BeanDefinition 如何变成实例”，两者不是同一维度。

## 工厂方法实例化链

```text
createBeanInstance
  -> instantiateUsingFactoryMethod
  -> ConstructorResolver.instantiateUsingFactoryMethod
  -> 找到静态工厂类或实例工厂 Bean
  -> 解析方法参数
  -> 选择匹配的 factory method
  -> InstantiationStrategy.instantiate
  -> 返回原始 Bean 实例
```

`@Bean` 方法会在 BeanDefinition 中保存 factory bean name 和 factory method name。Spring 创建返回对象时，本质上走的也是工厂方法链，而不是直接扫描方法后永久保存一个现成对象。

## FactoryBean 产品对象链

`FactoryBean` 有两段不同生命周期：先创建工厂 Bean，再取得它生产的对象。

```text
AbstractBeanFactory.doGetBean
  -> 创建或取得 FactoryBean 实例
  -> getObjectForBeanInstance
  -> FactoryBeanRegistrySupport.getObjectFromFactoryBean
  -> doGetObjectFromFactoryBean
  -> FactoryBean.getObject
  -> postProcessObjectFromFactoryBean
  -> 可选写入 factoryBeanObjectCache
```

普通名称返回产品对象，`&beanName` 返回 `FactoryBean` 本身。产品是否缓存由 `FactoryBean#isSingleton()`、容器单例状态以及缓存条件共同决定，不能把它简单等同于 BeanDefinition 的 singleton 属性。

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

## Bean 创建源码题回答模板

> 我会先区分注册和实例化。组件扫描、`@Bean`、`@Import`、XML、自动配置或编程式 API 先形成 BeanDefinition。真正创建时从 `getBean()` 进入 `doGetBean()` 和 `createBean()`，再到 `doCreateBean()`。`createBeanInstance()` 根据元数据选择 Supplier、工厂方法、构造器装配或默认构造器；之后 `populateBean()` 完成属性注入，`initializeBean()` 执行生命周期回调和 BeanPostProcessor，最终还可能返回 AOP 代理。`FactoryBean` 又多一层：先创建工厂 Bean，再通过 `getObjectFromFactoryBean()` 调用 `getObject()` 取得产品。

## 事务源码题回答模板

> 以事务为例，入口是代理的 TransactionInterceptor.invoke，核心模板在 invokeWithinTransaction。它先通过 TransactionAttributeSource 读取方法和类上的事务元数据，再选择 TransactionManager 获取或创建事务；随后执行拦截器链中的目标方法，按异常回滚规则提交或回滚。事务资源通常通过同步管理器绑定到当前线程，所以自调用没有进入拦截器、异步线程没有原上下文时都会失效。生产上我会再结合连接池、事务时长和外部副作用说明边界。

## 调试技巧

- 在定义注册、Bean 创建、后置处理和代理调用的关键入口设置条件断点。
- 调试 `@Bean` 或第三方客户端创建时，检查 factory bean、factory method、构造参数和 `instanceSupplier`。
- 遇到 `FactoryBean` 类型疑问时，同时检查普通名称与 `&` 前缀，以及产品对象缓存。
- 打印 BeanDefinition 来源、运行期 Bean 类型和 Advisor，而不是只打印类名。
- 对启动卡顿使用线程转储和启动阶段指标，不要在每个 Spring 方法打断点。
- 对版本差异以当前依赖源码为准，避免背某个旧版本内部字段后强行套用。
