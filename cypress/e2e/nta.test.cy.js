/// <reference types="cypress" />
// Cypress test for New Todo App with API

const { empty } = require("check-more-types");

describe("api-todo-app test party", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("Should have a sticky todo", () => {
    cy.get("#list").should("have.length.greaterThan", 0);
  });

  it("Should add todos", () => {
    cy.get("#input-box").type("Fancy test");
    cy.get("#btn-add-todo").click();
  });

  it("Should not add empty todos", () => {
    cy.get("#btn-add-todo").click();
    cy.on("window:alert", (alertText) => {
      expect(alertText).to.equal(
        "I would appreciate if you entered something."
      );
    });
  });

  it("Should not add duplicates", () => {
    cy.get("#input-box").type("Fancy test");
    cy.get("#btn-add-todo").click();
    cy.get("#input-box").clear().type("Fancy test");
    cy.get("#btn-add-todo").click();
    cy.on("window:alert", (alertText) => {
      expect(alertText).to.equal("No duplicate Todo's please.");
    });
  });

  it("Filter-check", () => {
    cy.get("#input-box").clear().type("Filter test");
    cy.get("#btn-add-todo").click();
    cy.get("#input-box").clear().type("Filter test 2");
    cy.get("#btn-add-todo").click();
    cy.get("#input-box").clear().type("Filter test 3");
    cy.get("#btn-add-todo").click();
    cy.get('[type="checkbox"]').first().check();
    cy.get('[type="checkbox"]').last().check();
    cy.get("#done").check();
    cy.get("#list")
      .children()
      .each(($el) => {
        cy.wrap($el).find('[type="checkbox"]').should("be.checked");
      });
    cy.get("#open").check();
    cy.get("#list")
      .children()
      .each(($el) => {
        cy.wrap($el).find('[type="checkbox"]').should("not.be.checked");
      });
  });

  it("Should delete checked items", () => {
    let startLength;
    cy.get("#list")
      .children()
      .then(($children) => {
        startLength = $children.length;
      });
    let checkLength;
    cy.get('#list [type="checkbox"]:checked').then(($checkedCheckboxes) => {
      checkLength = $checkedCheckboxes.length;
    });

    cy.get("#removeTodos").click();

    let finishLength;
    cy.get("#list")
      .children()
      .then(($children) => {
        finishLength = $children.length;
        expect(finishLength).to.equal(startLength - checkLength);
      });
  });

  it("Delete all items", () => {
    cy.get('#list [type="checkbox"]').check();
    cy.get("#removeTodos").click();
    cy.get("#list").should("have.length", 1);
    cy.get("#list").should(
      "have.text",
      "Sticky ToDo: Do NOT Forget to buy COFFEE!"
    );
  });
});
