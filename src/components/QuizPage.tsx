import React, { useState, useEffect, useRef } from 'react';

const QUIZ_COURSES = [
  {
    code: 'CSC204',
    title: 'Assembly Language Programming',
    questions: [
      {
        question: 'Which of the following is a low-level programming language?',
        options: ['Python', 'Java', 'Assembly', 'C++'],
        answer: 2,
      },
      {
        question: 'What is the primary purpose of an assembler?',
        options: [
          'Convert assembly code to machine code',
          'Execute assembly programs',
          'Debug assembly programs',
          'Optimize high-level code',
        ],
        answer: 0,
      },
      {
        question: 'In assembly language, a label is used for:',
        options: [
          'Defining variables',
          'Representing addresses',
          'Storing input values',
          'Formatting output',
        ],
        answer: 1,
      },
      {
        question: 'The CPU register primarily used for arithmetic and logic operations is:',
        options: [
          'Stack Pointer',
          'Accumulator',
          'Instruction Pointer',
          'Base Register',
        ],
        answer: 1,
      },
      {
        question: 'The directive used to define a constant value in Assembly is:',
        options: ['MOV', 'EQU', 'JMP', 'ADD'],
        answer: 1,
      },
      {
        question: 'The instruction MOV AX, BX does what?',
        options: [
          'Moves data from AX to BX',
          'Moves data from BX to AX',
          'Copies AX to memory',
          'Copies BX to memory',
        ],
        answer: 1,
      },
      {
        question: 'What does the JMP instruction do?',
        options: [
          'Terminates the program',
          'Jumps to a specified memory location',
          'Compares two values',
          'Moves data between registers',
        ],
        answer: 1,
      },
      {
        question: 'Which register holds the address of the next instruction to be executed?',
        options: ['AX', 'BP', 'SP', 'IP'],
        answer: 3,
      },
      {
        question: 'The process of breaking an instruction into smaller operations for execution is called:',
        options: ['Compiling', 'Pipelining', 'Assembling', 'Debugging'],
        answer: 1,
      },
      {
        question: 'The result of the AND operation between 1010 and 1100 is:',
        options: ['1000', '1110', '1010', '0100'],
        answer: 0,
      },
      {
        question: 'The stack in assembly language follows which principle?',
        options: ['FIFO', 'LIFO', 'Random Access', 'Sequential Access'],
        answer: 1,
      },
      {
        question: 'The instruction PUSH AX performs what action?',
        options: [
          'Removes AX from stack',
          'Adds AX to stack',
          'Transfers AX to BX',
          'Loads AX from memory',
        ],
        answer: 1,
      },
      {
        question: 'The instruction POP BX does what?',
        options: [
          'Removes BX from the stack',
          'Stores BX in memory',
          'Loads BX from stack',
          'Moves BX to AX',
        ],
        answer: 2,
      },
      {
        question: 'The instruction used to call a subroutine is:',
        options: ['RET', 'CALL', 'JMP', 'LOOP'],
        answer: 1,
      },
      {
        question: 'What is the full form of BIOS?',
        options: [
          'Basic Input Output System',
          'Binary Interface Operating System',
          'Basic Interactive Operating System',
          'Bus Integrated Output System',
        ],
        answer: 0,
      },
      {
        question: 'The INT instruction is used for:',
        options: [
          'Conditional jumps',
          'Interrupt handling',
          'Arithmetic operations',
          'Moving data',
        ],
        answer: 1,
      },
      {
        question: 'The function of the HLT instruction is:',
        options: [
          'Halt the execution',
          'Jump to the next instruction',
          'Perform multiplication',
          'Rotate bits',
        ],
        answer: 0,
      },
      {
        question: 'The size of a general-purpose register in a 32-bit system is:',
        options: ['8 bits', '16 bits', '32 bits', '64 bits'],
        answer: 2,
      },
      {
        question: 'The opcode for moving immediate data into a register is:',
        options: ['MOV', 'ADD', 'JMP', 'CALL'],
        answer: 0,
      },
      {
        question: 'A conditional jump is executed when:',
        options: [
          'The instruction pointer changes',
          'A specific flag is set',
          'A function is called',
          'Data is stored in memory',
        ],
        answer: 1,
      },
      {
        question: 'The segment register responsible for storing data is:',
        options: ['CS', 'DS', 'SS', 'ES'],
        answer: 1,
      },
      {
        question: 'The register pair used in 8086 for multiplication and division is:',
        options: ['AX and BX', 'AX and DX', 'CX and DX', 'SP and BP'],
        answer: 1,
      },
      {
        question: 'Which of the following represents a hexadecimal number?',
        options: ['101101', '3A4F', '110010', '12345'],
        answer: 1,
      },
      {
        question: 'Which flag is set when a subtraction results in zero?',
        options: ['Carry Flag', 'Zero Flag', 'Overflow Flag', 'Sign Flag'],
        answer: 1,
      },
      {
        question: 'The NEG instruction in Assembly:',
        options: [
          'Converts positive to negative',
          'Swaps registers',
          'Jumps to a label',
          'Clears the stack',
        ],
        answer: 0,
      },
      {
        question: 'The LOOP instruction decrements which register?',
        options: ['AX', 'CX', 'DX', 'BX'],
        answer: 1,
      },
      {
        question: 'The function of the OR operation is to:',
        options: [
          'Multiply values',
          'Compare values',
          'Set bits if either bit is 1',
          'Reset the processor',
        ],
        answer: 2,
      },
      {
        question: 'What does the ROL instruction do?',
        options: [
          'Rotate bits left',
          'Rotate bits right',
          'Move bits to another register',
          'Jump to a subroutine',
        ],
        answer: 0,
      },
      {
        question: 'What happens when the DIV instruction is executed with zero as the divisor?',
        options: [
          'The CPU halts',
          'An interrupt is generated',
          'The operation completes normally',
          'The program exits',
        ],
        answer: 1,
      },
      {
        question: 'The CMP instruction is used to:',
        options: [
          'Compare two values',
          'Move data',
          'Perform logical operations',
          'Multiply two numbers',
        ],
        answer: 0,
      },
    ],
  },
  {
    code: 'GST202',
    title: 'Peace Studies and Conflict Resolution',
    questions: [
      { question: 'What is the primary goal of Peace Studies?', options: ['Promoting war strategies', 'Understanding conflicts and resolutions', 'Supporting armed conflicts', 'Ignoring disputes'], answer: 1 },
      { question: 'Which of the following is NOT a type of conflict?', options: ['Intrapersonal conflict', 'Interpersonal conflict', 'Economic conflict', 'Emotional conflict'], answer: 2 },
      { question: 'A peaceful society is built on the foundation of:', options: ['Tolerance and dialogue', 'Armed resistance', 'Political suppression', 'Economic sanctions'], answer: 0 },
      { question: 'Mediation is a process where:', options: ['A third party helps resolve conflicts', 'Both parties escalate their disputes', 'No communication takes place', 'The stronger party dominates'], answer: 0 },
      { question: 'Conflict resolution requires:', options: ['Communication and understanding', 'Ignoring the issues', 'Blaming one party', 'Using force'], answer: 0 },
      { question: 'What is negotiation in conflict resolution?', options: ['A process of reaching a mutual agreement', 'A way to enforce one\'s decision', 'A violent method of resolving disputes', 'A legal punishment'], answer: 0 },
      { question: 'A major cause of conflict in organizations is:', options: ['Effective communication', 'Scarce resources', 'Cooperation among employees', 'Understanding between managers'], answer: 1 },
      { question: 'Which of these is NOT a peaceful conflict resolution method?', options: ['Dialogue', 'Mediation', 'Violence', 'Compromise'], answer: 2 },
      { question: 'The United Nations was established primarily to:', options: ['Promote international peace and security', 'Enforce economic policies', 'Dominate weaker nations', 'Expand military influence'], answer: 0 },
      { question: 'Which of these is a key aspect of peacebuilding?', options: ['Diplomacy', 'Violence', 'Economic sanctions', 'War strategies'], answer: 0 },
      { question: 'One major strategy for conflict prevention is:', options: ['Ignoring tensions', 'Proactive dialogue', 'Increasing hostilities', 'Limiting cooperation'], answer: 1 },
      { question: 'The term "non-violence" refers to:', options: ['Resolving issues without physical aggression', 'Using force to settle disputes', 'Political suppression', 'Economic manipulation'], answer: 0 },
      { question: 'What is the role of tolerance in peacebuilding?', options: ['To increase social harmony', 'To promote hostility', 'To divide communities', 'To suppress minority groups'], answer: 0 },
      { question: 'Which of the following is a form of structural violence?', options: ['Political oppression', 'Open warfare', 'Verbal disputes', 'Sports competitions'], answer: 0 },
      { question: 'Peace education helps in:', options: ['Promoting awareness of conflict resolution methods', 'Encouraging war strategies', 'Suppressing public knowledge', 'Limiting access to dialogue'], answer: 0 },
      { question: 'The concept of "positive peace" refers to:', options: ['The presence of justice and equality', 'The absence of open war but ongoing oppression', 'A military truce', 'A temporary ceasefire'], answer: 0 },
      { question: 'Which institution is responsible for international conflict resolution?', options: ['United Nations', 'FIFA', 'International Olympic Committee', 'NASA'], answer: 0 },
      { question: 'Which of the following is an example of interpersonal conflict?', options: ['Two employees arguing over work responsibilities', 'A trade war between countries', 'A political crisis', 'A military invasion'], answer: 0 },
      { question: 'What is the first step in resolving a conflict?', options: ['Identifying the root cause', 'Ignoring the problem', 'Blaming one party', 'Escalating the situation'], answer: 0 },
      { question: 'A mediator in conflict resolution should be:', options: ['Neutral and unbiased', 'Supportive of one side', 'Controlling and authoritative', 'Aggressive'], answer: 0 },
      { question: 'Conflict transformation focuses on:', options: ['Addressing the root causes and creating long-term solutions', 'Making conflicts worse', 'Ignoring the issue', 'Using violence as a resolution tool'], answer: 0 },
      { question: 'Which of these is a method used in alternative dispute resolution (ADR)?', options: ['Arbitration', 'War strategies', 'Political suppression', 'Armed rebellion'], answer: 0 },
      { question: 'What does a "win-win" solution in conflict resolution mean?', options: ['Both parties benefit', 'Only one party wins', 'The conflict continues indefinitely', 'No party benefits'], answer: 0 },
      { question: 'The "conflict cycle" describes:', options: ['How conflicts escalate and de-escalate', 'The process of war preparations', 'The timeline of economic crises', 'The repetition of social media trends'], answer: 0 },
      { question: 'A major reason for international conflicts is:', options: ['Competition for resources', 'Peace agreements', 'Diplomatic relations', 'Cultural exchange programs'], answer: 0 },
      { question: 'Which of these is a preventive measure for workplace conflicts?', options: ['Clear communication and policies', 'Lack of leadership', 'Favoritism in promotions', 'Encouraging discrimination'], answer: 0 },
      { question: 'The term "reconciliation" in peace studies means:', options: ['Restoring relationships after a conflict', 'Encouraging ongoing hostility', 'Avoiding dialogue', 'Enforcing military action'], answer: 0 },
      { question: 'Which of the following is NOT a characteristic of a successful mediator?', options: ['Impartiality', 'Active listening', 'Taking sides', 'Problem-solving skills'], answer: 2 },
      { question: 'The "peace dividend" refers to:', options: ['Economic benefits resulting from peace', 'The cost of maintaining a military', 'The expenses of war', 'The price of arms negotiations'], answer: 0 },
      { question: 'What is an important ethical principle in conflict resolution?', options: ['Respect for human rights', 'Suppressing public voices', 'Encouraging corruption', 'Promoting inequality'], answer: 0 },
    ],
  },
  {
    code: 'GST204',
    title: 'Resource Management and Organizational Behavior',
    questions: [
      { question: 'Which of the following is a key function of management?', options: ['Planning', 'Wasting resources', 'Avoiding teamwork', 'Delaying projects'], answer: 0 },
      { question: 'Organizational behavior is the study of:', options: ['How people behave in workplaces', 'Economic trends', 'Government policies', 'Personal habits'], answer: 0 },
      { question: 'One effective resource management strategy is:', options: ['Budgeting', 'Hoarding resources', 'Reducing employee salaries unfairly', 'Ignoring performance tracking'], answer: 0 },
      { question: 'Which of the following is NOT a component of organizational culture?', options: ['Values', 'Norms', 'Technology', 'Beliefs'], answer: 2 },
      { question: 'A key principle of time management in organizations is:', options: ['Prioritization', 'Procrastination', 'Ignoring deadlines', 'Overloading employees'], answer: 0 },
      { question: 'Which leadership style is most democratic?', options: ['Autocratic', 'Laissez-faire', 'Transformational', 'Dictatorial'], answer: 2 },
      { question: 'Effective communication in an organization leads to:', options: ['Reduced misunderstandings', 'Increased conflict', 'Poor teamwork', 'Low productivity'], answer: 0 },
      { question: 'Human resource management focuses on:', options: ['Employee welfare and development', 'Managing finances', 'Selling products', 'Controlling customers'], answer: 0 },
      { question: 'One of the key challenges in resource management is:', options: ['Resource scarcity', 'Having excess resources', 'Ignoring resources', 'Eliminating planning'], answer: 0 },
      { question: 'Delegation in management means:', options: ['Assigning tasks to subordinates', 'Ignoring responsibilities', 'Removing all decision-making power', 'Working alone'], answer: 0 },
      { question: 'Motivation in the workplace is important because it:', options: ['Increases employee productivity', 'Reduces work quality', 'Encourages absenteeism', 'Promotes employee conflicts'], answer: 0 },
      { question: 'A major source of workplace conflict is:', options: ['Poor communication', 'Clear guidelines', 'Effective teamwork', 'Employee rewards'], answer: 0 },
      { question: 'The primary objective of strategic management is to:', options: ['Achieve long-term organizational goals', 'Focus on short-term profits only', 'Increase workplace conflict', 'Limit employee participation'], answer: 0 },
      { question: 'Decision-making in an organization should be:', options: ['Logical and well-informed', 'Based on guesswork', 'Random and unplanned', 'Made without employee input'], answer: 0 },
      { question: 'Which of the following is NOT a responsibility of a manager?', options: ['Setting goals', 'Ignoring team progress', 'Monitoring performance', 'Allocating resources'], answer: 1 },
      { question: 'Which of these is a financial resource in an organization?', options: ['Cash flow', 'Employee skills', 'Organizational culture', 'Machinery'], answer: 0 },
      { question: 'Conflict resolution in an organization involves:', options: ['Open dialogue and negotiation', 'Increasing misunderstandings', 'Ignoring the problem', 'Encouraging workplace fights'], answer: 0 },
      { question: 'Which of these is an external factor affecting organizational behavior?', options: ['Economic conditions', 'Employee motivation', 'Management style', 'Teamwork skills'], answer: 0 },
      { question: 'The first step in problem-solving in an organization is:', options: ['Identifying the issue', 'Ignoring the issue', 'Assigning blame', 'Avoiding discussions'], answer: 0 },
      { question: 'Performance appraisals are used to:', options: ['Evaluate employee performance', 'Fire employees randomly', 'Delay promotions', 'Reduce salaries'], answer: 0 },
      { question: 'Which of these is an example of organizational behavior?', options: ['How employees interact with each other', 'How machines operate', 'The design of office furniture', 'The company\'s financial statement'], answer: 0 },
      { question: 'A good team leader should:', options: ['Encourage collaboration', 'Avoid communication', 'Ignore team members', 'Promote favoritism'], answer: 0 },
      { question: 'What is the main purpose of organizational culture?', options: ['To define company values and expectations', 'To increase workplace conflicts', 'To reduce employee engagement', 'To prevent teamwork'], answer: 0 },
      { question: 'Job satisfaction is influenced by:', options: ['Work environment and incentives', 'Lack of communication', 'Job insecurity', 'Poor leadership'], answer: 0 },
      { question: 'In time management, the Eisenhower Matrix is used to:', options: ['Prioritize tasks based on urgency and importance', 'Manage financial resources', 'Track employee attendance', 'Improve customer relationships'], answer: 0 },
      { question: 'Workplace ethics refer to:', options: ['Moral principles guiding employee behavior', 'The color of office walls', 'How computers function', 'Employee vacation schedules'], answer: 0 },
      { question: 'Employee training programs help to:', options: ['Improve skills and efficiency', 'Increase employee turnover', 'Reduce productivity', 'Limit career growth'], answer: 0 },
      { question: 'The primary goal of financial resource management is:', options: ['Efficient use of company funds', 'Wasting money', 'Avoiding budgeting', 'Ignoring financial reports'], answer: 0 },
      { question: 'A toxic work environment is characterized by:', options: ['Poor communication and frequent conflicts', 'Collaboration and teamwork', 'Employee engagement and support', 'Clear company values'], answer: 0 },
      { question: 'The best way to handle workplace stress is:', options: ['Practicing time management and self-care', 'Ignoring the workload', 'Increasing work pressure', 'Avoiding tasks'], answer: 0 },
    ],
  },
  {
    code: 'CSC206',
    title: 'Theory of Computation',
    questions: [
      { question: 'What is the primary focus of the theory of computation?', options: ['Understanding computer hardware', 'Designing user interfaces', 'Studying abstract machines and problems they can solve', 'Coding web applications'], answer: 2 },
      { question: 'A Turing machine is:', options: ['A type of compiler', 'A theoretical computational model', 'A network device', 'A programming language'], answer: 1 },
      { question: 'Which of the following is not a formal language class in the Chomsky hierarchy?', options: ['Regular languages', 'Context-free languages', 'Natural languages', 'Recursively enumerable languages'], answer: 2 },
      { question: 'A finite automaton can recognize:', options: ['Context-free languages', 'Regular languages', 'Turing-decidable languages', 'NP-complete problems'], answer: 1 },
      { question: 'What does PDA stand for in computation theory?', options: ['Personal Data Analyzer', 'Pushdown Automaton', 'Parallel Data Architecture', 'Programming Data Algorithm'], answer: 1 },
      { question: 'The pumping lemma is used to:', options: ['Prove that a language is regular', 'Design finite automata', 'Execute Turing machines', 'Measure time complexity'], answer: 0 },
      { question: 'A non-deterministic finite automaton differs from a deterministic one in that:', options: ['It always accepts all inputs', 'It can have multiple transitions for the same input', 'It uses more memory', 'It runs slower'], answer: 1 },
      { question: 'Which machine accepts context-free languages?', options: ['DFA', 'NFA', 'PDA', 'Turing machine'], answer: 2 },
      { question: 'The class NP includes problems that are:', options: ['Solvable in constant time', 'Verifiable in polynomial time', 'Not solvable', 'Solvable only by quantum computers'], answer: 1 },
      { question: 'A language is said to be decidable if:', options: ['A Turing machine exists that always halts with an answer', 'No algorithm can solve it', 'It can only be solved by humans', 'It has infinite strings'], answer: 0 },
      { question: 'Which of these is an undecidable problem?', options: ['Halting problem', 'Sorting numbers', 'Multiplying matrices', 'Finding prime numbers'], answer: 0 },
      { question: 'A DFA must have:', options: ['A finite set of states', 'A tape and a head', 'A stack', 'Infinite memory'], answer: 0 },
      { question: 'The start state in an automaton is where:', options: ['The computation ends', 'The computation begins', 'Transitions loop infinitely', 'The stack is initialized'], answer: 1 },
      { question: 'A language in automata theory is:', options: ['A set of valid strings', 'A compiler function', 'A user interface', 'A hardware module'], answer: 0 },
      { question: 'An epsilon transition allows:', options: ['A state change without input symbol', 'Infinite loops', 'Skipping the input', 'Removing the start state'], answer: 0 },
      { question: 'A context-sensitive grammar is more powerful than:', options: ['Regular and context-free grammars', 'Turing machines', 'NP-complete problems', 'Lexical analyzers'], answer: 0 },
      { question: 'A transition function in an automaton:', options: ['Maps state and input to next state', 'Compiles code', 'Counts memory', 'Multiplies strings'], answer: 0 },
      { question: 'The output of a Turing machine is:', options: ['A string on its tape', 'A regular expression', 'A binary number', 'A compiled code'], answer: 0 },
      { question: 'In computation theory, an alphabet is:', options: ['A finite set of symbols', 'A programming language', 'A user input form', 'A compiler tool'], answer: 0 },
      { question: 'A regular expression can describe:', options: ['Regular languages only', 'Context-free languages', 'All languages', 'Turing computable functions'], answer: 0 },
      { question: 'Which of the following is a closure property of regular languages?', options: ['Union', 'Intersection', 'Complement', 'All of the above'], answer: 3 },
      { question: 'A grammar consists of:', options: ['Terminals, non-terminals, start symbol, and rules', 'Tables and graphs', 'Data types', 'Input devices'], answer: 0 },
      { question: 'A language is recursively enumerable if:', options: ['A Turing machine exists that accepts it', 'It can be described by a DFA', 'It is context-free', 'It is finite'], answer: 0 },
      { question: 'Which of these machines has no memory?', options: ['DFA', 'PDA', 'Turing machine', 'RAM'], answer: 0 },
      { question: 'In a CFG, the productions are of the form:', options: ['A → α', 'A + B', 'A == B', 'A × B'], answer: 0 },
      { question: 'The complexity class P consists of problems:', options: ['Solvable in polynomial time', 'Without a solution', 'Solvable only by humans', 'That are undecidable'], answer: 0 },
      { question: 'A problem is NP-complete if:', options: ['It is both in NP and NP-hard', 'It cannot be solved', 'It has no known algorithm', 'It uses regular expressions'], answer: 0 },
      { question: 'Ambiguity in grammar means:', options: ['A string can be derived in more than one way', 'A string cannot be derived', 'A grammar has no terminals', 'The language is undefined'], answer: 0 },
      { question: 'The halting problem proves that:', options: ['Some problems cannot be decided by any machine', 'All machines can solve all problems', 'Automata can halt at will', 'Algorithms always terminate'], answer: 0 },
      { question: 'What does computability mean?', options: ['A problem has a well-defined algorithm', 'A problem requires hardware', 'A program runs infinitely', 'The problem is unsolvable'], answer: 0 },
    ],
  },
  {
    code: 'CSC208',
    title: 'Computer Architecture',
    questions: [
      { question: 'What is the primary function of the ALU in a computer?', options: ['Store data permanently', 'Perform arithmetic and logic operations', 'Manage the user interface', 'Control input/output devices'], answer: 1 },
      { question: 'Which component is considered the brain of the computer?', options: ['RAM', 'CPU', 'Hard Disk', 'Power Supply'], answer: 1 },
      { question: 'The Control Unit of the CPU:', options: ['Executes instructions', 'Directs operations of the processor', 'Stores data', 'Displays results'], answer: 1 },
      { question: 'Which memory type is volatile?', options: ['ROM', 'Flash', 'RAM', 'SSD'], answer: 2 },
      { question: 'The fetch-decode-execute cycle is associated with:', options: ['Instruction processing', 'Data storage', 'Power supply', 'Networking'], answer: 0 },
      { question: 'Bus in computer architecture refers to:', options: ['Transport system', 'Electrical pathway to transfer data', 'Control panel', 'Cooling system'], answer: 1 },
      { question: 'Which register holds the address of the next instruction?', options: ['MAR', 'PC', 'ACC', 'MDR'], answer: 1 },
      { question: 'Which of the following is a non-volatile memory?', options: ['RAM', 'Cache', 'ROM', 'Registers'], answer: 2 },
      { question: 'A multiplexer is used to:', options: ['Store data', 'Select one input from many', 'Add numbers', 'Control memory'], answer: 1 },
      { question: 'Which cache level is usually smallest and fastest?', options: ['L1', 'L2', 'L3', 'L4'], answer: 0 },
      { question: 'What is pipelining in processor design?', options: ['Executing one instruction at a time', 'Executing multiple instructions simultaneously in stages', 'Storing data in pipes', 'Slowing down processing'], answer: 1 },
      { question: 'The Harvard architecture separates:', options: ['Software and hardware', 'Memory for data and instructions', 'RAM and ROM', 'ALU and CU'], answer: 1 },
      { question: 'Which device converts analog to digital signals?', options: ['ADC', 'DAC', 'CPU', 'SSD'], answer: 0 },
      { question: 'The unit that stores intermediate arithmetic results is:', options: ['Register', 'Hard drive', 'RAM', 'Cache'], answer: 0 },
      { question: 'Instruction Set Architecture (ISA) defines:', options: ['Operating system protocols', 'Set of instructions the CPU can execute', 'Memory address', 'Register size'], answer: 1 },
      { question: 'What does RISC stand for?', options: ['Reduced Instruction Set Computer', 'Rapid Integrated System Controller', 'Random Instruction Storage Cycle', 'Register Integrated Speed Component'], answer: 0 },
      { question: 'What is the main advantage of RISC?', options: ['Simpler instructions', 'Larger size', 'Slower speed', 'More complex instructions'], answer: 0 },
      { question: 'What is a clock cycle?', options: ['Time taken to rotate hard disk', 'Time taken to execute an instruction', 'The memory refresh time', 'The screen refresh time'], answer: 1 },
      { question: 'The size of a register is measured in:', options: ['Volts', 'Bytes', 'Bits', 'Pixels'], answer: 2 },
      { question: 'Which memory is closest to the processor?', options: ['Cache', 'RAM', 'SSD', 'HDD'], answer: 0 },
      { question: 'Interrupts are used to:', options: ['Delay operations', 'Signal attention to the processor', 'Increase clock speed', 'Transfer memory'], answer: 1 },
      { question: 'What is the role of the decoder in the CPU?', options: ['Execute instructions', 'Interpret and convert opcode', 'Store program counters', 'Switch power'], answer: 1 },
      { question: 'The von Neumann bottleneck refers to:', options: ['Slow data transfer between CPU and memory', 'Heat generation in processor', 'Lack of parallelism', 'Input errors'], answer: 0 },
      { question: 'Which register temporarily holds data being transferred?', options: ['MDR', 'MAR', 'PC', 'IR'], answer: 0 },
      { question: 'What is microprogramming?', options: ['Writing small programs', 'Programming control logic', 'Assembling hardware', 'Handling file systems'], answer: 1 },
      { question: 'A CPU with multiple cores can:', options: ['Run multiple tasks in parallel', 'Use one instruction at a time', 'Only run one process', 'Access ROM only'], answer: 0 },
      { question: 'A system\'s word size determines:', options: ['Number of bits processed at once', 'Clock speed', 'Hard disk size', 'OS version'], answer: 0 },
      { question: 'The stack is a:', options: ['Last-in, first-out data structure', 'Random file system', 'Storage for operating systems', 'GUI feature'], answer: 0 },
      { question: 'A program counter:', options: ['Holds the address of the next instruction', 'Counts the number of programs', 'Controls cache', 'Increases speed'], answer: 0 },
      { question: 'Which one of the following stores BIOS?', options: ['ROM', 'RAM', 'Cache', 'HDD'], answer: 0 },
    ],
  },
  {
    code: 'CSC202',
    title: 'Data Structures and Algorithms',
    questions: [
      { question: 'Which data structure uses FIFO (First In First Out)?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1 },
      { question: 'A stack follows which principle?', options: ['FIFO', 'FILO', 'LIFO', 'LILO'], answer: 2 },
      { question: 'Which algorithm is used for searching in a sorted array?', options: ['Linear Search', 'Bubble Sort', 'Binary Search', 'DFS'], answer: 2 },
      { question: 'Which data structure is best for implementing recursion?', options: ['Queue', 'Stack', 'Tree', 'Array'], answer: 1 },
      { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(1)'], answer: 2 },
      { question: 'Which sorting algorithm is the fastest on average for large datasets?', options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Selection Sort'], answer: 2 },
      { question: 'In a binary tree, each node has at most:', options: ['One child', 'Two children', 'Three children', 'Four children'], answer: 1 },
      { question: 'Which algorithm is used for finding the shortest path in a graph?', options: ['DFS', 'BFS', 'Dijkstra\'s Algorithm', 'Bubble Sort'], answer: 2 },
      { question: 'What is a linked list?', options: ['A collection of sorted arrays', 'A collection of nodes connected using pointers', 'A static memory structure', 'A binary tree'], answer: 1 },
      { question: 'Which of the following is not a linear data structure?', options: ['Array', 'Stack', 'Queue', 'Tree'], answer: 3 },
      { question: 'What does DFS stand for in graph algorithms?', options: ['Depth First Search', 'Data File System', 'Double Flow Sequence', 'Direct Function Sorting'], answer: 0 },
      { question: 'The time complexity of inserting at the end of a singly linked list is:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 2 },
      { question: 'A circular queue avoids:', options: ['Overflow', 'Underflow', 'Wasting space', 'Insertion'], answer: 2 },
      { question: 'What is the maximum number of nodes in a binary tree of height h?', options: ['h', '2^h - 1', 'h^2', 'h + 1'], answer: 1 },
      { question: 'Which data structure is used in Breadth First Search?', options: ['Stack', 'Queue', 'Heap', 'Tree'], answer: 1 },
      { question: 'In a min-heap, the root node contains:', options: ['Maximum value', 'Minimum value', 'Average value', 'Random value'], answer: 1 },
      { question: 'Which of the following has O(n^2) time complexity in worst case?', options: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Heap Sort'], answer: 2 },
      { question: 'Which is not a characteristic of a good algorithm?', options: ['Unambiguous', 'Finite', 'Infinite steps', 'Effective'], answer: 2 },
      { question: 'A hash table is used for:', options: ['Sorting', 'Searching', 'Encryption', 'Network routing'], answer: 1 },
      { question: 'Which traversal visits the left subtree, root, and then right subtree?', options: ['Preorder', 'Postorder', 'Inorder', 'Level order'], answer: 2 },
      { question: 'In a doubly linked list, nodes have:', options: ['One pointer', 'Two pointers', 'Three pointers', 'No pointers'], answer: 1 },
      { question: 'Which of these is non-linear data structure?', options: ['Stack', 'Queue', 'Array', 'Tree'], answer: 3 },
      { question: 'What is the worst-case time complexity of Quick Sort?', options: ['O(log n)', 'O(n log n)', 'O(n^2)', 'O(n)'], answer: 2 },
      { question: 'A graph consists of:', options: ['Nodes and edges', 'Arrays and stacks', 'Trees and branches', 'Linked lists and pointers'], answer: 0 },
      { question: 'What is a priority queue?', options: ['Queue where each item has a priority', 'Queue sorted by insertion time', 'Stack-based queue', 'Static queue'], answer: 0 },
      { question: 'In a hash table, collision occurs when:', options: ['Two keys hash to the same index', 'Memory runs out', 'Data is duplicated', 'Search fails'], answer: 0 },
      { question: 'A singly linked list allows traversal in:', options: ['Both directions', 'One direction only', 'Random direction', 'No direction'], answer: 1 },
      { question: 'What does a heap represent?', options: ['A tree-based data structure', 'A collection of arrays', 'A memory allocator', 'A type of queue'], answer: 0 },
      { question: 'What is the advantage of using a linked list over an array?', options: ['Constant time access', 'Better memory usage for dynamic data', 'Easier sorting', 'Static size'], answer: 1 },
      { question: 'Which algorithm uses divide and conquer strategy?', options: ['Quick Sort', 'Bubble Sort', 'Linear Search', 'DFS'], answer: 0 },
    ],
  },
];

const QUIZ_TIME_LIMIT = 20 * 60; // 20 minutes in seconds

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const QuizPage: React.FC<{ token: string }> = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showFullSubmitConfirm, setShowFullSubmitConfirm] = useState(false);

  useEffect(() => {
    if (started) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [started]);

  useEffect(() => {
    if (selectedCourse !== null) {
      setAnswers(Array(QUIZ_COURSES[selectedCourse].questions.length).fill(null));
      setCurrent(0);
      setTimeLeft(QUIZ_TIME_LIMIT);
      setStarted(false);
    }
  }, [selectedCourse]);

  const handleAnswer = (idx: number) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[current] = idx;
      return copy;
    });
  };

  const handleStart = () => setStarted(true);

  const course = selectedCourse !== null ? QUIZ_COURSES[selectedCourse] : null;
  const total = course ? course.questions.length : 0;
  const progress = total ? ((answers.filter((a) => a !== null).length) / total) * 100 : 0;

  // Quiz landing page
  if (selectedCourse === null) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white bg-opacity-80 rounded-2xl shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Take a Quiz</h2>
        <div className="space-y-4">
          {QUIZ_COURSES.map((c, i) => (
            <button
              key={c.code}
              onClick={() => setSelectedCourse(i)}
              className="block w-full text-left p-4 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow transition-colors text-lg font-semibold text-blue-900"
            >
              {c.code}: {c.title} ({c.questions.length} CBT Questions)
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Quiz rules and start
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white bg-opacity-80 rounded-2xl shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{course?.code}: {course?.title}</h2>
        <div className="mb-6 text-gray-700">
          <div className="mb-2 font-semibold text-red-600">Warning & Rules:</div>
          <ul className="list-disc pl-6 space-y-1">
            <li>Do not refresh or leave the page during the quiz.</li>
            <li>Each question is multiple choice. Only one answer is correct.</li>
            <li>You have <span className="font-bold">20 minutes</span> to complete all questions.</li>
            <li>Once you start, the timer cannot be paused.</li>
            <li>Answered questions will be highlighted below the question area.</li>
            <li>Click the numbers to jump to any question.</li>
          </ul>
        </div>
        <div className="mb-6 text-gray-800 font-medium">Time Limit: <span className="font-bold">20:00</span> minutes</div>
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow transition-colors"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // Quiz in progress
  if (showSubmitConfirm) {
    const answered = answers.filter((a) => a !== null).length;
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white bg-opacity-80 rounded-2xl shadow-xl animate-fade-in text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Are you sure you want to submit?</h2>
        <div className="mb-6 text-lg text-gray-800">You've only answered <span className="font-bold">{answered}</span> of {total} questions.</div>
        <div className="flex justify-center gap-6 mt-8">
          <button
            className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-lg shadow"
            onClick={() => setShowSubmitConfirm(false)}
          >
            No
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow"
            onClick={() => {
              // Calculate score
              let score = 0;
              for (let i = 0; i < total; i++) {
                if (answers[i] === course!.questions[i].answer) score++;
              }
              setFinalScore(score);
              setShowSubmitConfirm(false);
              setShowCongrats(true);
            }}
          >
            Yes
          </button>
        </div>
      </div>
    );
  }

  if (showCongrats) {
    return (
      <div className="w-full h-screen min-h-screen flex items-center justify-center p-0 m-0 relative overflow-hidden animate-fade-in">
        {/* Background image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <img src="/library-bg-2.jpg" alt="Congratulations background" className="w-full h-full object-cover object-center select-none pointer-events-none" style={{ userSelect: 'none' }} />
          <div className="absolute inset-0 w-full h-full" style={{ background: 'rgba(37,99,235,0.4)' }} />
        </div>
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full p-4 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6 text-white drop-shadow-lg">CONGRATULATIONS !!!</h2>
          <div className="mb-6 sm:mb-8 text-lg sm:text-2xl font-bold text-white drop-shadow-lg">You have just completed your quiz.</div>
          <div className="mb-8 sm:mb-10 text-xl sm:text-3xl font-extrabold text-yellow-300 drop-shadow-lg">You scored <span className="text-white">{finalScore}</span> / {total}</div>
          <button
            className="px-6 sm:px-10 py-3 sm:py-4 rounded-lg bg-white hover:bg-primary text-blue-700 font-bold text-base sm:text-xl shadow-lg transition-colors"
            onClick={() => { setShowCongrats(false); setShowReview(true); }}
          >
            REVIEW QUIZ
          </button>
        </div>
      </div>
    );
  }

  if (showReview) {
    if (!course) return null;
    return (
      <div className="max-w-2xl mx-auto mt-10 p-4 sm:p-8 bg-white bg-opacity-80 rounded-2xl shadow-xl animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Quiz Review</h2>
        {course.questions.map((q, qIdx) => {
          const userAns = answers[qIdx];
          return (
            <div key={qIdx} className="mb-8">
              <div className="text-lg font-semibold text-gray-900 mb-2">Question {qIdx + 1}:</div>
              <div className="text-base font-bold text-gray-800 mb-3 break-words whitespace-normal">{q.question}</div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  let optClass = 'bg-gray-100 text-gray-800';
                  if (idx === q.answer) optClass = 'bg-green-500 text-white';
                  if (userAns === idx && userAns !== q.answer) optClass = 'bg-red-500 text-white';
                  return (
                    <div key={idx} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium border ${optClass}`}> 
                      <span className="font-bold text-lg">{String.fromCharCode(65 + idx)}</span>
                      <input type="checkbox" className="ml-2 accent-blue-600" checked={userAns === idx} readOnly />
                      <span className="ml-2">{opt}</span>
                      {idx === q.answer && <span className="ml-2 text-xs font-bold">(Correct)</span>}
                      {userAns === idx && userAns !== q.answer && <span className="ml-2 text-xs font-bold">(Your answer)</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="flex justify-center mt-8">
          <button
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow"
            onClick={() => {
              setShowReview(false);
              setSelectedCourse(null);
              setAnswers([]);
              setStarted(false);
              setCurrent(0);
              setTimeLeft(QUIZ_TIME_LIMIT);
            }}
          >
            TAKE ANOTHER QUIZ
          </button>
        </div>
      </div>
    );
  }

  if (showFullSubmitConfirm) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white bg-opacity-80 rounded-2xl shadow-xl animate-fade-in text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-green-700">CONGRATULATIONS!!!</h2>
        <div className="mb-6 text-lg text-gray-800">You have successfully answered all questions. Do you want to submit now?</div>
        <div className="flex justify-center gap-6 mt-8">
          <button
            className="px-6 py-3 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-lg shadow"
            onClick={() => setShowFullSubmitConfirm(false)}
          >
            CROSSCHECK
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow"
            onClick={() => {
              // Calculate score
              let score = 0;
              for (let i = 0; i < total; i++) {
                if (answers[i] === course!.questions[i].answer) score++;
              }
              setFinalScore(score);
              setShowFullSubmitConfirm(false);
              setShowCongrats(true);
            }}
          >
            SUBMIT NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full mx-auto mt-6 sm:mt-10 p-2 sm:p-4 md:p-8 bg-white bg-opacity-80 rounded-2xl shadow-xl animate-fade-in relative">
      {/* Progress bar and timer */}
      <div className="w-full flex items-center mb-6 gap-4">
        <div className="flex-1">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex-shrink-0 text-lg font-bold text-gray-800 bg-gray-100 px-4 py-1 rounded-lg border border-gray-200">
          {formatTime(timeLeft)}
        </div>
      </div>
      {/* Question */}
      <div className="mb-6">
        <div className="text-lg font-semibold text-gray-900 mb-4">
          Question {current + 1} of {total}
        </div>
        <div className="text-base font-bold text-gray-800 mb-3 break-words whitespace-normal">
          {course?.questions[current].question}
        </div>
        <div className="space-y-3">
          {course?.questions[current].options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`block w-full text-left px-4 py-3 rounded-lg border transition-colors font-medium flex items-center gap-3
                ${answers[current] === idx ? 'bg-blue-600 text-white border-blue-700 shadow' : 'bg-gray-50 hover:bg-blue-50 border-gray-200'}`}
            >
              <span className="font-bold text-lg">{String.fromCharCode(65 + idx)}</span>
              <input type="checkbox" className="ml-2 accent-blue-600" checked={answers[current] === idx} readOnly />
              <span className="ml-2">{opt}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Number navigation */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {course?.questions.map((_, idx) => {
          let color = 'bg-gray-200 text-gray-700';
          if (answers[idx] !== null) color = 'bg-green-500 text-white';
          if (idx === current) color = 'bg-blue-600 text-white border-2 border-blue-800';
          return (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-9 h-9 rounded-full font-bold flex items-center justify-center border transition-colors ${color}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
      {/* Navigation buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
            disabled={current === total - 1}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50"
          >
            Next
          </button>
          <button
            onClick={() => {
              if (answers.filter((a) => a === null).length === 0) {
                setShowFullSubmitConfirm(true);
              } else {
                setShowSubmitConfirm(true);
              }
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors
              ${answers.filter((a) => a === null).length === 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
            disabled={showSubmitConfirm || showCongrats || showReview || showFullSubmitConfirm}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage; 