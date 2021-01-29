
const webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
//import org.openqa.selenium.WebElement
const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();

// Test for register form input
driver.get('http://0.0.0.0:3001/admin/register').then(function(){
   email = driver.findElement(By.name('email'))
   username = driver.findElement(By.name('username'))
   first = driver.findElement(By.name('firstname'))
   last = driver.findElement(By.name('lastname'))
   institution = driver.findElement(By.name('institution'))
   password = driver.findElement(By.name('password'))
   
   email.sendKeys('abc@mbl.edu')
   username.sendKeys('tUser')
   first.sendKeys('Test')
   last.sendKeys('User')
   institution.sendKeys('Central State U.')
   password.sendKeys('abCdEf')
   
   regButton = driver.findElement(By.id('register'))
   regButton.click()
// driver.findElement(webdriver.By.name('username')).sendKeys('webdriver\n').then(function(){
//     driver.getTitle().then(function(title) {
//       console.log(title)
//       if(title === 'HOMD :: Signup') {
//          console.log('Title Test Passed');
//          // goto additional tests
//       } else {
//          console.log('Test failed');
//          driver.quit();
//       }
//      
//     });
//   });

   //driver.quit();
});



