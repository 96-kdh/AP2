# AP2 TypeScript Sample (Demo Only)

이 프로젝트는 Google AP2 샘플(`samples/python`)의 구조와 타입을 참고해서,
TypeScript 로 *데모용* 에이전트 구조를 옮겨놓은 예제입니다.

> ⚠️ 이 코드는 **실제 AP2 / adk-js 런타임과 통합된 구현이 아니라**,  
> AP2 의 주요 타입(JSON 스키마)과 에이전트 역할(Shopping / Merchant / Merchant Payment Processor / Credentials Provider)을
> TypeScript 로 정리한 **학습용 / 데모용 코드**입니다.

---

## 폴더 구조

```text
ap2-ts-sample/
  package.json
  tsconfig.json
  README.md

  src/
    ap2/
      types/
        contactPicker.ts
        paymentRequest.ts
        mandate.ts
        paymentReceipt.ts
        constants.ts
        index.ts

    common/
      a2aTypes.ts
      a2aMessageBuilder.ts
      baseServerExecutor.ts
      messageUtils.ts
      paymentRemoteA2aClient.ts
      validation.ts
      simpleTaskUpdater.ts

    roles/
      merchant_agent/
        agentExecutor.ts
        tools.ts
        storage.ts

      merchant_payment_processor_agent/
        agentExecutor.ts
        tools.ts

      credentials_provider_agent/
        accountManager.ts
        tools.ts
        agentExecutor.ts

      shopping_agent/
        tools.ts
        agent.ts

    demo.ts
```

- `src/ap2/types/*`  
  - Python 의 `src/ap2/types/*.py` (Pydantic 모델) 을 TypeScript 인터페이스로 옮긴 것.
  - `PaymentRequest`, `PaymentResponse`, `IntentMandate`, `CartMandate`, `PaymentMandate`, `PaymentReceipt` 등
    AP2 플로우에서 사용하는 JSON 구조를 그대로 맞추려고 했습니다 (snake_case 필드명 유지).

- `src/common/*`  
  - A2A 메시지 타입(`Message`, `Part`) 와 간단한 빌더/Executor/검증 유틸을 정의한 공간입니다.
  - 실제 adk-js 와의 결합 대신, 데모 코드를 작성할 수 있을 정도의 최소 스켈레톤만 들어 있습니다.

- `src/roles/*`  
  - `shopping_agent` : Intent/Cart/Payment Mandate 를 만들고 결제를 트리거하는 에이전트.
  - `merchant_agent` : PaymentMandate 를 받아 merchant payment processor 로 전달하는 역할(데모에서는 직접 호출).
  - `merchant_payment_processor_agent` : 카드 결제를 처리하는 PSP/카드 네트워크 역할(완전 mock).
  - `credentials_provider_agent` : 유저 이메일 + alias 를 받아 mock credential token 을 발급하는 역할(데모에서는 직접 사용하지는 않지만 구조만 포함).

- `src/demo.ts`  
  - `runShoppingDemo()` 를 호출해서 **전체 happy-path 플로우**를 콘솔에서 시연하는 엔트리 포인트입니다.

---

## 설치 및 실행

### 1. 의존성 설치

`.env` 파일을 프로젝트 루트(`AP2/.env` 또는 `AP2/samples/js/.env`)에 두고,
`GOOGLE_GENAI_API_KEY` 또는 `GEMINI_API_KEY` 값을 채워주세요. 이미 `GOOGLE_API_KEY`
로만 저장해두었다면 런타임에서 자동으로 `GOOGLE_GENAI_API_KEY`/`GEMINI_API_KEY`
로 매핑됩니다.

```bash
npm install
```

> Node.js 18+ 와 npm 이 설치되어 있다고 가정합니다.

### 2. 데모 실행 (ts-node 사용)

```bash
npx ts-node src/demo.ts
# 또는
npm run demo
```

실행하면 대략 다음과 같은 로그가 출력됩니다:

```text
=== AP2 TS Demo: Shopping Flow ===
Payment receipt:
{
  "payment_mandate_id": "mandate_...",
  "timestamp": "...",
  "payment_id": "pay_...",
  "amount": {
    "currency": "USD",
    "value": 19.99
  },
  "payment_status": {
    "merchant_confirmation_id": "APPROVED",
    "psp_confirmation_id": "PSP-SAMPLE-001"
  },
  "payment_method_details": {
    "processor": "demo-card-processor"
  }
}
```

---

### 3. Dev UI + A2A 데모 서버 실행

Python 샘플처럼 **8001 ~ 8003 포트**에 AP2 A2A 데모 에이전트가
열리도록 스크립트를 추가했습니다. 아래 명령을 실행하면

- 8001: Merchant Agent (`/a2a/merchant_agent`)
- 8002: Credentials Provider Agent (`/a2a/credentials_provider`)
- 8003: Merchant Payment Processor Agent (`/a2a/merchant_payment_processor_agent`)

가 동시에 기동되고, 기존 Dev UI(`npm run dev`)도 8000번 포트에서 같이 열립니다.

```bash
npm run dev
```

에이전트 서버만 별도로 띄우려면 아래 명령을 사용할 수 있습니다:

```bash
npm run dev:servers
```

---

## 역할별 코드 매핑 (Python 샘플 대비)

- **AP2 타입 (`src/ap2/types/*`)**
  - Python 의 `src/ap2/types/payment_request.py`, `mandate.py`, `payment_receipt.py`, `contact_picker.py`
  - → 동일한 JSON 스키마를 TS 인터페이스로 정의

- **Shopping Agent (`src/roles/shopping_agent/*`)**
  - Python `samples/python/src/roles/shopping_agent/*` 의 전체 대화/서브에이전트 구조를 단순화
  - 한 번의 함수 호출(`runShoppingDemo`)로 Intent → Cart → PaymentMandate → PaymentReceipt 까지 이어지는
    happy-path 플로우를 구현

- **Merchant Agent (`src/roles/merchant_agent/*`)**
  - Python 의 Merchant Agent 처럼 PaymentMandate 를 받아서
    `merchant_payment_processor_agent` 에게 넘기는 개념을 유지하되,
    데모에서는 `processCardPayment` 함수를 직접 호출하도록 단순화

- **Merchant Payment Processor Agent (`src/roles/merchant_payment_processor_agent/*`)**
  - Python 의 `merchant_payment_processor_agent` 가 맡는 역할을 TS 로 옮김.
  - PaymentMandate 를 받아 카드 결제 승인/거절을 판단하고, `PaymentReceipt` 를 만들어 반환

- **Credentials Provider Agent (`src/roles/credentials_provider_agent/*`)**
  - Python 의 Credentials Provider Agent 구조를 참고해,
    이메일 + alias 에 대한 mock account 데이터와, credential token 발급 함수를 제공합니다.
  - 이 데모에서는 직접 사용하지는 않지만, AP2 플로우를 확장할 때 그대로 활용할 수 있습니다.

---

## 실제 AP2 / adk-js 통합 시에

이 샘플은 **폴더 구조와 타입, 역할 분리**에 집중한 코드입니다.  
실제로 Google ADK (`adk-js`) 와 AP2 레퍼런스 구현에 연결하려면:

1. `src/common/a2aTypes.ts`, `a2aMessageBuilder.ts`, `baseServerExecutor.ts` 등을
   adk-js 의 타입과 인터페이스에 맞게 교체하거나, 해당 라이브러리를 import 해서 사용하고
2. 각 `*Executor` 클래스(예: `MerchantAgentExecutor`, `MerchantPaymentProcessorExecutor`) 를
   adk 서버에서 인스턴스화해서 `/a2a/...` 엔드포인트에 매핑하면 됩니다.
3. 현재 demo 에서 함수 직접 호출로 처리한 부분을,  
   A2A 메시지 기반 호출로 변경하면 Python 샘플과 거의 1:1 구조가 됩니다.

---

## 다음 단계 아이디어

- Shopping Agent 에 LLM(Prompt + Tools)를 붙여서 실제 자연어 → IntentMandate 생성까지 시연
- adk-js 를 직접 의존성에 추가하고, `adk-js` 의 `AgentExecutor`/`TaskUpdater` 와 통합
- HTTP 서버(Express 등)를 추가해서 `/a2a/merchant_agent`, `/a2a/merchant_payment_processor_agent` 등을 실제 엔드포인트로 노출

이 저장소는 그런 통합 작업을 하기 전에,  
**타입/JSON 스키마/역할 분리**를 먼저 TS 로 정리해보는 용도로 쓰면 좋습니다.
