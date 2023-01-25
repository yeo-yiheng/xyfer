const fs = require("fs");
const solc = require("solc");

async function instantiateContract(baseContractPath) {
  console.log("Compiling contract");
  const sources = {};
  compileImports(baseContractPath, sources);

  var input = {
    language: "Solidity",
    sources: sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const output = solc.compile(JSON.stringify(input));
  const contract = JSON.parse(output);
  const abi = contract.contracts[baseContractPath]["XyferSend"]["abi"];
  const bytecode = contract.contracts[baseContractPath]["XyferSend"]["evm"]["bytecode"]["object"];

  return {
    bytecode: bytecode,
    abi: abi
  }
};

const compileImports = (root, sources) => {
    root = root.replace('"', '');
    sources[root] = { content: fs.readFileSync(root, "utf8") };
    const imports = getNeededImports(root);
    for (let i = 0; i < imports.length; i++) {
        compileImports(imports[i], sources);
    }
};

const getNeededImports = (path) => {
  const file = fs.readFileSync(path, "utf8");
  const files = new Array();
  file
    .toString()
    .split("\n")
    .forEach(function (line, index, arr) {
      if (
        (index === arr.length - 1 && line === "") ||
        !line.trim().startsWith("import")
      ) {
        return;
      }
      const relativePath = line.substring(8, line.length - 2);
      const fullPath = buildFullPath(path, relativePath);
      files.push(fullPath);
    });
  return files;
};

const buildFullPath = (parent, path) => {
  let curDir = parent.substr(0, parent.lastIndexOf("/")); 
  if (path.startsWith("./")) {
    return curDir + "/" + path.substr(2);
  }

  while (path.startsWith("../")) {
    curDir = curDir.substr(0, curDir.lastIndexOf("/"));
    path = path.substr(3);
  }

  return curDir + "/" + path;
};

module.exports = instantiateContract;