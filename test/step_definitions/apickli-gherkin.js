const apiclkiGherkin = require('apickli/apickli-gherkin');

const { defineSupportCode } = require('cucumber');

defineSupportCode(({ Given, When, Then, registerHandler }) => {
    const stepDefinitions = apiclkiGherkin.bind(this);
    this.Given = Given;
    this.When = When;
    this.Then = Then;
    this.registerHandler = registerHandler;
    stepDefinitions();
});
