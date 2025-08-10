export const extraJavaClasses = ["Math", "System", "String", "Object"];

export const javaLibMethods = {
  // ─── Collections & Interfaces ─────────────────────────────────────
  List: [
    'add', 'addAll', 'remove', 'removeAll', 'retainAll',
    'get', 'set', 'size', 'isEmpty', 'contains', 'containsAll',
    'indexOf', 'lastIndexOf', 'subList', 'iterator', 'listIterator',
    'toArray'
  ],
  ArrayList: [
    'add', 'addAll', 'remove', 'removeAll', 'retainAll',
    'get', 'set', 'size', 'isEmpty', 'contains',
    'indexOf', 'lastIndexOf', 'subList', 'trimToSize',
    'ensureCapacity', 'toArray'
  ],
  LinkedList: [
    'add', 'addFirst', 'addLast', 'remove', 'removeFirst',
    'removeLast', 'get', 'getFirst', 'getLast', 'size',
    'isEmpty', 'contains', 'iterator', 'listIterator'
  ],

  Map: [
    'put', 'putAll', 'get', 'remove', 'containsKey',
    'containsValue', 'keySet', 'values', 'entrySet', 
    'isEmpty', 'size', 'clear', 'replace', 'computeIfAbsent'
  ],
  HashMap: [
    'put', 'putAll', 'get', 'remove', 'containsKey',
    'containsValue', 'keySet', 'values', 'entrySet',
    'isEmpty', 'size', 'clear', 'replace', 'computeIfAbsent'
  ],
  TreeMap: [
    'put', 'putAll', 'get', 'remove', 'firstKey',
    'lastKey', 'keySet', 'values', 'entrySet',
    'isEmpty', 'size', 'clear', 'subMap', 'headMap', 'tailMap'
  ],

  Set: [
    'add', 'addAll', 'remove', 'removeAll',
    'contains', 'containsAll', 'isEmpty', 'size',
    'iterator', 'toArray'
  ],
  HashSet: [
    'add', 'addAll', 'remove', 'removeAll',
    'contains', 'containsAll', 'isEmpty', 'size',
    'iterator', 'toArray'
  ],
  TreeSet: [
    'add', 'remove', 'first', 'last',
    'iterator', 'subSet', 'headSet', 'tailSet',
    'size', 'isEmpty', 'contains', 'toArray'
  ],

  Collections: [
    'sort', 'reverse', 'shuffle', 'binarySearch',
    'min', 'max', 'singletonList', 'emptyList',
    'unmodifiableList', 'frequency', 'reverseOrder'
  ],
  Arrays: [
    'asList', 'sort', 'binarySearch', 'copyOf',
    'fill', 'equals', 'deepEquals', 'toString',
    'stream', 'parallelSort'
  ],

  Iterator: ['hasNext', 'next', 'remove'],

  // ─── Core java.lang ────────────────────────────────────────────────
  String: [
    'charAt', 'codePointAt', 'compareTo', 'concat',
    'contains', 'endsWith', 'equals', 'equalsIgnoreCase',
    'format', 'indexOf', 'isEmpty', 'lastIndexOf',
    'length', 'matches', 'replace', 'replaceAll',
    'split', 'substring', 'toCharArray', 'toLowerCase',
    'toUpperCase', 'trim', 'valueOf'
  ],
  StringBuilder: [
    'append', 'insert', 'replace', 'delete',
    'deleteCharAt', 'reverse', 'toString',
    'capacity', 'ensureCapacity', 'setLength'
  ],
  StringBuffer: [
    'append', 'insert', 'replace', 'delete',
    'deleteCharAt', 'reverse', 'toString',
    'capacity', 'ensureCapacity', 'setLength'
  ],

  Object: [
    'equals', 'hashCode', 'toString', 'getClass',
    'notify', 'notifyAll', 'wait'
  ],

  System: [
    'arraycopy', 'currentTimeMillis', 'nanoTime',
    'exit', 'gc', 'getProperty', 'getenv',
    'setOut', 'setErr','out'
  ],
  Math: [
    'abs', 'acos', 'asin', 'atan', 'atan2', 'cbrt',
    'ceil', 'cos', 'cosh', 'exp', 'floor', 'hypot',
    'log', 'log10', 'max', 'min', 'pow', 'random',
    'round', 'sin', 'sinh', 'sqrt', 'tan', 'tanh'
  ],

  // ─── java.util.concurrent & misc ──────────────────────────────────
  Optional: [
    'isPresent', 'ifPresent', 'map', 'flatMap',
    'filter', 'orElse', 'orElseGet', 'orElseThrow',
    'get'
  ],
  Stream: [
    'filter', 'map', 'flatMap', 'distinct',
    'sorted', 'peek', 'limit', 'skip',
    'forEach', 'collect', 'reduce', 'count', 'toArray'
  ],

  Scanner: [
    'next', 'nextLine', 'nextInt', 'nextDouble',
    'hasNext', 'hasNextLine', 'useDelimiter', 'close'
  ],

  File: [
    'exists', 'createNewFile', 'delete', 'getName',
    'getPath', 'getAbsolutePath', 'isDirectory',
    'isFile', 'length', 'list', 'renameTo'
  ],
  Paths: ['get'],           // static
  Files: [
    'readAllBytes', 'readAllLines',
    'write', 'copy', 'delete',
    'exists', 'createFile', 'createDirectories'
  ],

  // ─── java.time ─────────────────────────────────────────────────────
  LocalDate: [
    'now', 'of', 'parse', 'plusDays',
    'minusDays', 'getYear', 'getMonth',
    'getDayOfMonth', 'format'
  ],
  LocalDateTime: [
    'now', 'of', 'parse', 'plusHours',
    'minusHours', 'getYear', 'getMonth',
    'getDayOfMonth', 'getHour', 'format'
  ],

  // ─── java.io & threading ───────────────────────────────────────────
  Thread: [
    'start', 'run', 'join', 'sleep',
    'interrupt', 'isAlive', 'setName',
    'getName', 'yield'
  ],
  Runtime: [
    'getRuntime', 'exec', 'freeMemory',
    'totalMemory', 'maxMemory', 'gc', 'exit'
  ],

  // ─── java.util.regex ──────────────────────────────────────────────
  Pattern: ['compile', 'split', 'matcher'],
  Matcher: ['find', 'matches', 'group', 'replaceAll'],

  // ─── big numbers ───────────────────────────────────────────────────
  BigDecimal: [
    'add', 'subtract', 'multiply', 'divide',
    'compareTo', 'setScale', 'toString'
  ],
  BigInteger: [
    'add', 'subtract', 'multiply', 'divide',
    'mod', 'pow', 'gcd', 'compareTo', 'toString'
  ]
};

export  const javaKeywords = [
      'abstract','assert','boolean','break','byte','case','catch','char',
      'class','const','continue','default','do','double','else','enum',
      'extends','final','finally','float','for','goto','if','implements',
      'import','instanceof','int','interface','long','native','new','package',
      'private','protected','public','return','short','static','strictfp',
      'super','switch','synchronized','this','throw','throws','transient',
      'try','void','volatile','while','System'
];
    
export const pythonLibMethods = {
  list:  ['append','extend','insert','remove','pop','clear','copy','index','count','sort','reverse'],
  dict:  ['get','keys','values','items','pop','update','clear','copy','setdefault'],
  set:   ['add','remove','discard','pop','union','intersection','difference','clear','copy','issubset','issuperset'],
  str:   ['capitalize','casefold','center','count','encode','endswith','find','format','isalnum','isalpha','isdigit','islower','isnumeric','isspace','istitle','isupper','join','lower','lstrip','replace','rfind','rindex','rsplit','rstrip','split','splitlines','startswith','strip','title','upper','zfill'],

  math:     ['ceil','floor','fabs','factorial','factorial','fsum','gcd','isfinite','isinf','isnan','trunc','exp','log','log10','pow','sqrt','sin','cos','tan','degrees','radians','hypot'],
  random:   ['random','uniform','randint','choice','shuffle','sample','seed','randrange','choices','getrandbits'],
  os:       ['listdir','mkdir','makedirs','remove','rmdir','getcwd','chdir','rename','system','getenv','environ','stat'],
  sys:      ['argv','exit','path','stdout','stderr','version','maxsize','getsizeof','modules'],
  datetime: ['date','time','datetime','timedelta','timezone','tzinfo','now','utcnow','today','fromtimestamp','strftime','strptime'],
  json:     ['dump','dumps','load','loads','JSONDecoder','JSONEncoder'],
  re:       ['compile','search','match','fullmatch','findall','finditer','sub','subn','split','escape'],
};

export const pythonKeywords = [
  'False','None','True','and','as','assert','async','await','break','class','continue',
  'def','del','elif','else','except','finally','for','from','global','if','import','in',
  'is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield', 'function'
];



export const extraPythonModules = Object.keys(pythonLibMethods);