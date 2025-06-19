# TESTPLAN for Wallet API Test Suite

---

## 1) Intercept-Based Tests (`walletTransaction_intercept.cy.js`)

| ID    | Test Case Name                                                        | Method | Endpoint                                                      | Mock Key               | Expected Status | Priority |
|-------|-----------------------------------------------------------------------|--------|---------------------------------------------------------------|------------------------|-----------------|----------|
| TC01  | POST valid credit transaction returns 200 & approved                  | POST   | `/wallet/{walletId}/transaction`                              | `validCredit`          | 200             | High     |
| TC02  | POST valid debit transaction returns 200 & approved                   | POST   | `/wallet/{walletId}/transaction`                              | `validDebit`           | 200             | High     |
| TC03  | GET approved transaction returns finished & approved                  | GET    | `/wallet/{walletId}/transaction/{approvedTransactionId}`      | `approvedFast`         | 200             | High     |
| TC04  | GET pending→approved transition returns finished & approved           | GET    | `/wallet/{walletId}/transaction/00000002-0000-…`              | `pendingThenApproved`  | 200             | High     |
| TC05  | GET pending→denied transition returns finished & denied               | GET    | `/wallet/{walletId}/transaction/00000003-0000-…`              | `pendingThenDenied`    | 200             | Medium   |
| TC06  | GET initial pending transaction returns pending                       | GET    | `/wallet/{walletId}/transaction/00000004-0000-…`              | `pendingInitial`       | 200             | Medium   |
| TC07  | GET zero-amount transaction returns amount 0.0                        | GET    | `/wallet/{walletId}/transaction/00000005-0000-…`              | `zeroAmount`           | 200             | Medium   |
| TC08  | GET large-amount transaction returns large number                     | GET    | `/wallet/{walletId}/transaction/00000006-0000-…`              | `largeAmount`          | 200             | Medium   |
| TC09  | GET decimal-amount transaction returns precise decimal                | GET    | `/wallet/{walletId}/transaction/00000007-0000-…`              | `decimalAmount`        | 200             | Low      |
| TC10  | GET non-existent transaction returns 404                              | GET    | `/wallet/{walletId}/transaction/non-existent-id`              | `notFound`             | 404             | Medium   |
| TC11  | GET invalid walletId format returns 422                               | GET    | `/wallet/invalid-wallet/transaction/{approvedTransactionId}`  | `invalidWalletId`      | 422             | Low      |
| TC12  | GET invalid transactionId format returns 422                          | GET    | `/wallet/{walletId}/transaction/bad-txn-id`                   | `invalidTransactionId` | 422             | Low      |
| TC13  | GET with invalid token returns 401                                    | GET    | `/wallet/{walletId}/transaction/{approvedTransactionId}`      | `unauthorized`         | 401             | Medium   |
| TC14  | GET with blank token returns 401                                      | GET    | `/wallet/{walletId}/transaction/{approvedTransactionId}`      | `blankToken`           | 401             | Medium   |
| TC15  | GET triggers server error returns 500                                 | GET    | `/wallet/{walletId}/transaction/{approvedTransactionId}`      | `internalError`        | 500             | Low      |

---

## 2) Prism-Backed Tests (`walletTransaction_prism.cy.js`)

| ID    | Test Case Name                             | Method | Endpoint                                              | Payload / Token           | Expected Status | Priority |
|-------|--------------------------------------------|--------|-------------------------------------------------------|---------------------------|-----------------|----------|
| TC01  | Valid credit transaction                   | POST   | `/wallet/{walletId}/transaction`                      | `validCredit` + token     | 200             | High     |
| TC02  | Valid debit transaction                    | POST   | `/wallet/{walletId}/transaction`                      | `validDebit` + token      | 200             | High     |
| TC03  | Invalid token                              | POST   | `/wallet/{walletId}/transaction`                      | bad token                 | 401             | High     |
| TC04  | Invalid currency in request                | POST   | `/wallet/{walletId}/transaction`                      | `invalidCurrency`         | 400             | Medium   |
| TC05  | Invalid amount string                      | POST   | `/wallet/{walletId}/transaction`                      | `invalidAmountString`     | 400             | Medium   |
| TC06  | Negative amount                            | POST   | `/wallet/{walletId}/transaction`                      | `negativeAmount`          | 400             | Medium   |
| TC07  | Invalid type                               | POST   | `/wallet/{walletId}/transaction`                      | `invalidType`             | 400             | Medium   |
| TC08  | Missing amount field                       | POST   | `/wallet/{walletId}/transaction`                      | `missingAmount`           | 400             | Medium   |
| TC09  | Extra field in body                        | POST   | `/wallet/{walletId}/transaction`                      | `extraField`              | 400             | Medium   |
| TC10  | GET approved transaction                   | GET    | `/wallet/{walletId}/transaction/{approvedTransactionId}` | token                  | 200             | High     |
| TC11  | GET denied transaction                     | GET    | `/wallet/{walletId}/transaction/{deniedTransactionId}`   | token                  | 200             | Medium   |
| TC12  | GET pending transaction                    | GET    | `/wallet/{walletId}/transaction/{pendingTransactionId}`  | token                  | 200             | Medium   |

---

## Unimplemented (Future) Test Cases (≤5)

1. **Third-party service timeout flow**  
   - Simulate an external approval taking >1 s → initial `pending`, then auto-`denied` after 30 minutes.  
   - _Priority_: High

2. **Concurrency & idempotency**  
   - Fire multiple simultaneous POSTs and verify no double-spend or negative balances.  
   - _Priority_: Low

3. **Schema evolution/backwards compatibility**  
   - Inject new optional fields (e.g. metadata) and confirm existing tests still pass.  
   - _Priority_: Low

4. **Extreme payload amounts**  
   - Test real API with very large (`9 999 999.99`) or zero (`0.0`) amounts.  
   - _Priority_: Medium

---

**Assumptions**  
- All tests focus strictly on **transaction** endpoints.  
- Authentication is stubbed via a static token.  
- Test data and mocks are externalized under `cypress/fixtures`.  
- JSON schemas validate both success (`transaction.json`) and error (`error.json`) payloads.  
- This plan is hand-crafted to match our naming conventions and interview expectations.  
