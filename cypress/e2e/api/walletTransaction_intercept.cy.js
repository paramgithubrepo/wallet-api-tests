// cypress/e2e/api/walletTransaction_intercept.cy.js

describe('Wallet API – Intercept Tests', () => {
  beforeEach(() => {
    cy.fixture('testData').as('data')
    cy.fixture('walletMocks').as('mocks')
  })

  const endpoint = (walletId, txnId = '') =>
    `/challenge/api/v1/wallet/${walletId}/transaction${txnId ? `/${txnId}` : ''}`

  context('POST /wallet/{walletId}/transaction', () => {
    it('TC01 – POST valid credit transaction returns 200 & approved', function () {
      cy.intercept('POST', endpoint(this.data.walletId), {
        statusCode: 200,
        body: this.mocks.validCredit,
      }).as('postCredit')

      cy.apiRequest(
        'POST',
        endpoint(this.data.walletId),
        this.data.validCredit,
        this.data.token,
        '@postCredit'
      ).then(res => {
        expect(res.status).to.eq(200)
        cy.validateSchema(res.body, 'transaction')
        expect(res.body.status).to.eq('finished')
        expect(res.body.outcome).to.eq('approved')
      })
    })

    it('TC02 – POST valid debit transaction returns 200 & approved', function () {
      cy.intercept('POST', endpoint(this.data.walletId), {
        statusCode: 200,
        body: this.mocks.validDebit,
      }).as('postDebit')

      cy.apiRequest(
        'POST',
        endpoint(this.data.walletId),
        this.data.validDebit,
        this.data.token,
        '@postDebit'
      ).then(res => {
        expect(res.status).to.eq(200)
        cy.validateSchema(res.body, 'transaction')
        expect(res.body.status).to.eq('finished')
        expect(res.body.outcome).to.eq('approved')
      })
    })
  })

  context('GET /wallet/{walletId}/transaction/{id} – Status Variants', () => {
    it('TC03 – GET approved transaction returns finished & approved', function () {
      cy.intercept(
        'GET',
        endpoint(this.data.walletId, this.data.approvedTransactionId),
        this.mocks.approvedFast
      ).as('approved')

      cy.apiRequest(
        'GET',
        endpoint(this.data.walletId, this.data.approvedTransactionId),
        null,
        this.data.token,
        '@approved'
      ).then(res => {
        expect(res.status).to.eq(200)
        cy.validateSchema(res.body, 'transaction')
        expect(res.body.status).to.eq('finished')
        expect(res.body.outcome).to.eq('approved')
      })
    })

    it('TC04 – GET pending→approved transition returns finished & approved', function () {
      const txnId = '00000002-0000-0000-0000-000000000002'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.pendingThenApproved).as('pendingApproved')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@pendingApproved')
        .then(res => {
          expect(res.status).to.eq(200)
          cy.validateSchema(res.body, 'transaction')
          expect(res.body.status).to.eq('finished')
          expect(res.body.outcome).to.eq('approved')
        })
    })

    it('TC05 – GET pending→denied transition returns finished & denied', function () {
      const txnId = '00000003-0000-0000-0000-000000000003'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.pendingThenDenied).as('pendingDenied')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@pendingDenied')
        .then(res => {
          expect(res.status).to.eq(200)
          cy.validateSchema(res.body, 'transaction')
          expect(res.body.status).to.eq('finished')
          expect(res.body.outcome).to.eq('denied')
        })
    })

    it('TC06 – GET initial pending transaction returns pending', function () {
      const txnId = '00000004-0000-0000-0000-000000000004'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.pendingInitial).as('pending')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@pending')
        .then(res => {
          expect(res.status).to.eq(200)
          cy.validateSchema(res.body, 'transaction')
          expect(res.body.status).to.eq('pending')
        })
    })
  })

  context('GET /wallet/{walletId}/transaction/{id} – Amount Variations', () => {
    it('TC07 – GET zero-amount transaction returns amount 0.0', function () {
      const txnId = '00000005-0000-0000-0000-000000000005'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.zeroAmount).as('zero')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@zero')
        .then(res => {
          cy.validateSchema(res.body, 'transaction')
          expect(res.body.amount).to.eq(0.0)
        })
    })

    it('TC08 – GET large-amount transaction returns large number', function () {
      const txnId = '00000006-0000-0000-0000-000000000006'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.largeAmount).as('large')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@large')
        .then(res => {
          cy.validateSchema(res.body, 'transaction')
          expect(res.body.amount).to.eq(9999999.99)
        })
    })

    it('TC09 – GET decimal-amount transaction returns precise decimal', function () {
      const txnId = '00000007-0000-0000-0000-000000000007'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.decimalAmount).as('decimal')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@decimal')
        .then(res => {
          cy.validateSchema(res.body, 'transaction')
          expect(res.body.amount).to.eq(123.456)
        })
    })
  })

  context('GET /wallet/{walletId}/transaction/{id} – Error Conditions', () => {
    it('TC10 – GET non-existent transaction returns 404', function () {
      const txnId = 'non-existent-id'
      cy.intercept('GET', endpoint(this.data.walletId, txnId), this.mocks.notFound).as('notFound')

      cy.apiRequest('GET', endpoint(this.data.walletId, txnId), null, this.data.token, '@notFound')
        .then(res => {
          cy.validateSchema(res.body, 'error')
          expect(res.status).to.eq(404)
          expect(res.body.error).to.contain('Transaction not found')
        })
    })

    it('TC11 – GET invalid walletId format returns 422', function () {
      cy.intercept('GET', endpoint('invalid-wallet', this.data.approvedTransactionId), this.mocks.invalidWalletId).as('invalidWallet')

      cy.apiRequest(
        'GET',
        endpoint('invalid-wallet', this.data.approvedTransactionId),
        null,
        this.data.token,
        '@invalidWallet'
      ).then(res => {
        expect(res.status).to.eq(422)
      })
    })

    it('TC12 – GET invalid transactionId format returns 422', function () {
      cy.intercept('GET', endpoint(this.data.walletId, 'bad-txn-id'), this.mocks.invalidTransactionId).as('invalidTxn')

      cy.apiRequest(
        'GET',
        endpoint(this.data.walletId, 'bad-txn-id'),
        null,
        this.data.token,
        '@invalidTxn'
      ).then(res => {
        expect(res.status).to.eq(422)
      })
    })
  })

  context('GET /wallet/{walletId}/transaction/{id} – Authorization Errors', () => {
    it('TC13 – GET with invalid token returns 401', function () {
      cy.intercept('GET', endpoint(this.data.walletId, this.data.approvedTransactionId), this.mocks.unauthorized).as('unauthorized')

      cy.apiRequest(
        'GET',
        endpoint(this.data.walletId, this.data.approvedTransactionId),
        null,
        'Bearer wrong-token',
        '@unauthorized'
      ).then(res => {
        cy.validateSchema(res.body, 'error')
        expect(res.status).to.eq(401)
      })
    })

    it('TC14 – GET with blank token returns 401', function () {
      cy.intercept('GET', endpoint(this.data.walletId, this.data.approvedTransactionId), this.mocks.blankToken).as('blankToken')

      cy.apiRequest(
        'GET',
        endpoint(this.data.walletId, this.data.approvedTransactionId),
        null,
        '',
        '@blankToken'
      ).then(res => {
        cy.validateSchema(res.body, 'error')
        expect(res.status).to.eq(401)
      })
    })

    it('TC15 – GET triggers server error returns 500', function () {
      cy.intercept('GET', endpoint(this.data.walletId, this.data.approvedTransactionId), this.mocks.internalError).as('serverError')

      cy.apiRequest(
        'GET',
        endpoint(this.data.walletId, this.data.approvedTransactionId),
        null,
        this.data.token,
        '@serverError'
      ).then(res => {
        cy.validateSchema(res.body, 'error')
        expect(res.status).to.eq(500)
      })
    })
  })
})
