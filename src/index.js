const { writeFile } = require("fs");
var { EOL } = require("os");

const { getRandomWordSync, getRandomWord } = require("word-maker");
const orderBy = require("lodash/orderBy");

// console.log("It works!");

/**
 * No. of iterations the get word methods should execute
 */
const iterations = 100;

/**
 * Error text during failure
 */
const errorSentence = "It shouldn't break anything!";

/**
 * Geneerates random words using getRandomWordSync
 */
const fizzBuzzSync = () => {
  const words = [];

  for (index = 1; index <= iterations; index++) {
    const word = fizzBuzz(index);

    if (word) {
      words.push({ index, word });
      continue;
    }

    try {
      const word = getRandomWordSync({ withErrors: true });
      words.push({ index, word });
    } catch (err) {
      //   console.error(`Error in getRandomWordSync. ${err}`);

      words.push({ index, word: errorSentence });
    }
  }

  writeToFile("sync.txt", words);
};

/**
 * Geneerates random words using getRandomWord
 */
const fizzBuzzAsync = async () => {
  const promises = [];
  const words = [];

  for (index = 1; index <= iterations; index++) {
    const word = fizzBuzz(index);

    if (word) {
      words.push({ index, word });
      continue;
    }

    // add to promise array
    promises.push(getRandomWordAsync(index));
  }

  // wait until all promises resolve
  await Promise.all(promises).then(results => {
    // append the async results to the end of the original array
    const combined = words.concat(results);

    // order by the index in ascending order
    const sorted = orderBy(combined, ["index"], ["asc"]);

    // write to file
    writeToFile("async.txt", sorted);
  });
};

/**
 * Helper wrapper to map index and generated random word
 * @param {*} index Iteration index
 */
const getRandomWordAsync = index => {
  return new Promise(resolve => {
    getRandomWord({ withErrors: true, slow: true })
      .then(word => {
        resolve({ index, word });
      })
      .catch(err => {
        // console.error(`Error in getRandomWord. ${err}`);

        // make sure no error is returned
        resolve({ index, word: errorSentence });
      });
  });
};

/**
 * Returns Fizz, Buzz or FizzBuzz accordingly
 * @param {*} number Number to check
 */
const fizzBuzz = number => {
  switch (true) {
    case number % 15 == 0: {
      return "FizzBuzz";
    }

    case number % 3 == 0: {
      return "Fizz";
    }

    case number % 5 == 0: {
      return "Buzz";
    }

    default:
      return null;
  }
};

/**
 *
 * @param {*} fileName Name of the file
 * @param {*} content Content to be written. Should be an array with the following format.
 *
 * [
 *  { index: 1, "word": "test1" },
 *  { index: 2, "word": "test2" }
 * ]
 */
const writeToFile = (fileName, words) => {
  let content = "";

  words.forEach(({ word }, index) => {
    content += `${(index += 1)}: ${word}${EOL}`;
  });

  writeFile(fileName, content, err => {
    if (err) {
      console.error(`Error writing to ${fileName}`);
      throw err;
    }

    console.log(`Saved ${fileName}`);
  });
};

/**
 * Fetch random words synchronously
 */
fizzBuzzSync();

/**
 * Fetch random words asynchronously
 */
fizzBuzzAsync();
