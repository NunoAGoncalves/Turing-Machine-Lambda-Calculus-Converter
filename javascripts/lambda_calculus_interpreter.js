// Code for creating a lambda calculus interpreter
// Author: Nuno Goncalves (NunoAGoncalves)

const IDENTIFIER = 101;
const ABSTRACTION = 102;
const APPLICATION = 103;

class Token { constructor(type, value) {
	this.type = type;
    this.value = value;
  }
}

class Node { constructor(type, left, right) {
	this.type = type;
	this.left = left;
	this.right = right; 
	this.highlight = false;
  }
}

function terminal_print() {}

 function clone(object) {
	return structuredClone(object);
	// return JSON.parse(JSON.stringify(object));
}

function stringify_tree(node) {
	
	if (!node) { return null; }
		
	let stack = [[node.type, node]];
	let str_list = [];
	
	while (stack.length) {
		
		let [ type, object ] = stack.pop();
		
		if (object != null && object.highlight) {
			stack.push(['HIGHLIGHT', null]);
			str_list.push('[[;#42f5b0;black]');
		}
	
		switch(type) {
			case IDENTIFIER:
				str_list.push($.terminal.escape_formatting(object.left));
				break;
			case ABSTRACTION:
				str_list.push('(λ');
				stack.push(['CLOSE', null]);
				stack.push([object.right.type, object.right]);
				stack.push(['DOT', null]);
				stack.push([object.left.type, object.left]);
				break;
			case APPLICATION:
				stack.push([object.right.type, object.right]);
				stack.push([object.left.type, object.left]);
				break;
			case 'CLOSE':
				str_list.push('\)');
				break;
			case 'DOT':
				str_list.push('\.');
				break;
			case 'HIGHLIGHT':
				str_list.push(']');
				break;
		}
	}
	return str_list.join('');
}

function get_input_alphabet(string) {
	let input_alphabet;
	if (string.length) {
		input_alphabet = new Set();
		for (let character of string) {
			input_alphabet.add(character);
		}
		return [...input_alphabet].sort();
	} 
	return [];
}

function finite_string_function(string, alphabet) {
	
	let prefix = ''
	for (let i = 1, l = alphabet.length; i < l + 1; i++) {
		prefix = prefix + 'λ[x_' + i + '].';
	}
	
	if (!string.length) {
		return '(' + prefix + 'λy.y' + ')'
	}
	
	let cur;
	let term = '';
	let stack = [];
	stack.push([string]);
	
	while (stack.length) {
		cur = stack.pop();
		if (!cur[0].length) {
			return '(' + term + prefix + 'λy.y' + ')' + ')'.repeat(string.length); 
		}
		if (alphabet.includes(cur[0][0]) == false) { 
			throw 'FINITE STRING FUNCTION ERROR: Element in string is not in alphabet'; 
		}
		term = term + prefix + 'λy.[x_' + (alphabet.indexOf(cur[0][0]) + 1) + ']' + '('
		stack.push([cur[0].substring(1)]);	
	}	
}

function convert_to_De_Brujin(node) {
	
	if (node == null) { return; }
	
	let stack = [];
	let output = '';
	
	stack.push(['RETURN', node, null, 0]);
	stack.push([node.type, node, {}, 0]);
	
	while (stack.length) {
		
		let [ type, cur_node, context, max ] = stack.pop();
		
		switch (type) { 
		
			case IDENTIFIER:
				if (cur_node.left in context) {
					output += context[cur_node.left].toString();
				} else {
					output += (max + 1).toString();
				}
				break;
			case ABSTRACTION:
			
				for (const [key, value] of Object.entries(context)) {
					context[key] += 1;
				}
				max += 1;
				context[cur_node.left.left] = 0;
				stack.push([cur_node.right.type, cur_node.right, context, max]);
				stack.push(['LAMBDA', null, null, null]);
				break;
				
			case APPLICATION:
				if (cur_node.right.type == ABSTRACTION) {
					stack.push(['BRACKETR', null, null, null]);
					stack.push([cur_node.right.type, cur_node.right, clone(context), max ]);
					stack.push(['BRACKETL', null, null, null]);
				}
				else {
					stack.push([cur_node.right.type, cur_node.right, clone(context), max ]);
				}
				
				if (cur_node.left.type == ABSTRACTION) {
					stack.push(['BRACKETR', null, null, null]);
					stack.push([cur_node.left.type,  cur_node.left,  clone(context), max ]);
					stack.push(['BRACKETL', null, null, null]);
				}
				else {
					stack.push([cur_node.left.type,  cur_node.left,  clone(context), max ]);
				}
				break;
			
			case 'LAMBDA':
				output += 'λ';
				break;
				
			case 'BRACKETL':
				output += '(';
				break;
				
			case 'BRACKETR':
				output += ')'
				break;
				
			case 'RETURN':
				return output;
		}
	}
}

function convert_to_T_Brujin(node) {
	
	if (node == null) {
		return;
	}
	
	let stack = [];
	let output = '';
	
	stack.push(['RETURN', node, null]);
	stack.push([node.type, node, {}]);
	
	while (stack.length) {
		
		let [ type, cur_node, context ] = stack.pop();
		
		switch (type) { 
		
			case IDENTIFIER:
				if (cur_node.left in context) {
					output += '> ' + context[cur_node.left].toString() + ' ';
				} else {
					output += '> ';
				}
				break;	
			case ABSTRACTION:
				for (const [key, value] of Object.entries(context)) {
					context[key] += 1;
				}
				context[cur_node.left.left] = 0;
				output += 'λ ';
				stack.push([cur_node.right.type, cur_node.right, context]);
				break;
			case APPLICATION:
				output += '@ '
				stack.push([cur_node.right.type, cur_node.right, clone(context)]);
				stack.push([cur_node.left.type, cur_node.left, clone(context)]);
				break;
				
			case 'RETURN':
				return output;
		
		}
	}
}
	
function is_free_variable(term, parameter) {
	
	if ((term == null || parameter == null)) return false;
	if (parameter.type != IDENTIFIER) return false;
	
	let stack = [term];
	
	while (stack.length > 0) {
		let cur = stack.shift();
		if (cur.type == ABSTRACTION && cur.left.left == parameter.left) {
			continue;
		}	
		if (cur.type == IDENTIFIER && cur.left == parameter.left) {
			return true;
		}
		if (cur.left != null) {
			stack.push(cur.left);
		}
		if (cur.right != null) {
			stack.push(cur.right);
		}
	}
	
	return false;
}

var FOO = (function() {
	
	let token_list;
	let original_AST;
	let substitution_counter;
	let alpha_reduction_counter;
	let print_flag;
	let weak_lambda_calculus_flag;
	
	function skip(type) {
		if (next(type)) {
			token_list.shift();
			return true;
		}
		return false;
	}
	
	function match(type) {
		if (next(type)) {
			token_list.shift();
			return;
		}
		throw "Something went badly wrong! (INCORRECT MATCH WITH TYPE " + type + ")";
	}
	
	function next(type) {
		if (token_list == null || token_list.length == 0) {
			return null;
		}
		return token_list[0].type == type;	
	}

	function highlight_substitution(term, directions) {
		
		let return_obj = clone(original_AST);
		let highlight_obj = clone(original_AST);

		let return_root = return_obj;
		let highlight_root = highlight_obj;
		
		if (directions.length == 0) {
			highlight_obj.left.left.highlight = true;
			highlight_obj.right.highlight = true;
			return [highlight_obj, term];
		}
		
		let final_dir = directions.pop();
		
		for (dir in directions) {
			if (directions[dir] === 'L') {
				return_obj = return_obj.left;
				highlight_obj = highlight_obj.left;
			}				
			else if (directions[dir] === 'R') {
				return_obj = return_obj.right;
				highlight_obj = highlight_obj.right;
			}
		}
		
		if (final_dir === 'L') {
			highlight_obj.left.left.left.highlight = true;
			highlight_obj.left.right.highlight = true;
			return_obj.left = term;
		}
		else if (final_dir === 'R') {
			highlight_obj.right.left.left.highlight = true;
			highlight_obj.right.right.highlight = true;
			return_obj.right = term;
		}
		
		return [highlight_root, return_root];
	}
	
	function substitute(expr_body, parameter, substitute_expr) {
		
		let term = expr_body.right;
		
		if (term == null || parameter == null || substitute_expr == null) {
			return null;
		}
		
		let prev = [];
		let stack = [];
		
		stack.push(['RETURN', null, null, null]);
		stack.push([term.type, term, parameter, substitute_expr]);
		
		while (stack.length) {
			
			let [ type, cur_term, cur_parameter, cur_expression ] = stack.pop();
			
			switch (type) {
				
				case IDENTIFIER:
					if (cur_term.left == cur_parameter.left) { // x[x := N] = N
						stack.push(['PREV', cur_expression, null, null]);	
					} 
					else {
						stack.push(['PREV', cur_term, null, null]);	
					}
					break;
					
				case APPLICATION:
					stack.push(['PREV', cur_term, null, null]);
					stack.push(['VARIABLE_R', cur_term, null, null]);
					stack.push([cur_term.right.type, cur_term.right, cur_parameter, cur_expression]);
					stack.push(['VARIABLE_L', cur_term, null, null]);
					stack.push([cur_term.left.type, cur_term.left, cur_parameter, cur_expression]);
					break;
				
				case ABSTRACTION:
					if (cur_term.left.left == cur_parameter.left) {
						stack.push(['PREV', cur_term, null, null]);	
					} 
					else if (weak_lambda_calculus_flag || !is_free_variable(cur_expression, cur_term.left)) {
						stack.push(['PREV', cur_term, null, null]);						
						stack.push(['VARIABLE_R', cur_term, null, null]);
						stack.push([cur_term.right.type, cur_term.right, cur_parameter, cur_expression]);
					} 
					else {
						stack.push(['RETURN_ALPHA', null, null, null]);
						stack.push(['PREV', expr_body, null, null]);						
						stack.push(['UPDATE', cur_term, cur_parameter, cur_expression]);
						stack.push(['VARIABLE_R', cur_term, null, null]);
						stack.push([cur_term.right.type, cur_term.right, cur_term.left, new Node(IDENTIFIER, '[S_' + alpha_reduction_counter.toString() + ']', null)]);
					}
					break;

				case 'VARIABLE_L':
					cur_term.left = prev.pop();
					break;
					
				case 'VARIABLE_R':
					cur_term.right = prev.pop();
					break;
					
				case 'RETURN':
					if (print_flag) {
						terminal_print('BETA REDUCTION (' + substitution_counter + '):');
						substitution_counter += 1;
					}
					return prev.pop();
					
				case 'RETURN_ALPHA':
					if (print_flag) {
						terminal_print('ALPHA CONVERSION (' + substitution_counter + '):');
						substitution_counter += 1;
					}
					return new Node(APPLICATION, prev.pop(), substitute_expr);
				
				case 'PREV':
					prev.push(cur_term);
					break;
					
				case 'UPDATE':
					cur_term.left.left = '[S_' + alpha_reduction_counter.toString() + ']';
					alpha_reduction_counter += 1;
					break;
				
			}
		}	
	}

	function parser(command) {

		let token;
		let index = 0;
		let token_list;
		let parser_list = [];
		let internal_flag = false;
		let res = command.split("");
		
		while (index < res.length) {
	
			let element = res[index];
			
			switch(element) {
				default:
					if (internal_flag) {
						token = new Token(IDENTIFIER, element);
						parser_list.push(token); 
					}
					break;
				case 'H': 
					token_list = [	new Token('('.charCodeAt(0), '('),
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'f'),
									new Token('.'.charCodeAt(0), '.'),
									new Token(IDENTIFIER, 'f'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'z'),
									new Token('.'.charCodeAt(0), '.'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'x'),
									new Token('.'.charCodeAt(0), '.'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'f'),
									new Token('.'.charCodeAt(0), '.'),
									new Token(IDENTIFIER, 'f'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'z'),
									new Token('.'.charCodeAt(0), '.'),
									new Token(IDENTIFIER, 'x'),
									new Token(IDENTIFIER, 'x'),
									new Token(IDENTIFIER, 'f'),
									new Token(IDENTIFIER, 'z'),
									new Token(')'.charCodeAt(0), ')'),
									new Token(')'.charCodeAt(0), ')'),
									new Token(')'.charCodeAt(0), ')'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'x'),
									new Token('.'.charCodeAt(0), '.'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'f'),
									new Token('.'.charCodeAt(0), '.'),
									new Token(IDENTIFIER, 'f'),
									new Token('('.charCodeAt(0), '('), 
									new Token('\\'.charCodeAt(0), '\\'),
									new Token(IDENTIFIER, 'z'),
									new Token('.'.charCodeAt(0), '.'),
									new Token(IDENTIFIER, 'x'),
									new Token(IDENTIFIER, 'x'),
									new Token(IDENTIFIER, 'f'),
									new Token(IDENTIFIER, 'z'),
									new Token(')'.charCodeAt(0), ')'),
									new Token(')'.charCodeAt(0), ')'),
									new Token(')'.charCodeAt(0), ')'),
									new Token(IDENTIFIER, 'f'),
									new Token(IDENTIFIER, 'z'),	
									new Token(')'.charCodeAt(0), ')'),
									new Token(')'.charCodeAt(0), ')')					   
					]
					parser_list = parser_list.concat(token_list);
					break;
			case 'I': // I = (\x.x)
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'x'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'x'),
								new Token(')'.charCodeAt(0), ')')
				]
				parser_list = parser_list.concat(token_list);
				break;
			case 'S': // S = (\xyz.xz(yz))
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'y'),
								new Token(IDENTIFIER, 'z'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'z'),
								new Token('('.charCodeAt(0), '('),
								new Token(IDENTIFIER, 'y'),
								new Token(IDENTIFIER, 'z'),
								new Token(')'.charCodeAt(0), ')'),
								new Token(')'.charCodeAt(0), ')')
				]
				parser_list = parser_list.concat(token_list);
				break;
			case 'K': // K ------- (\x.\y.x)
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'y'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'x'),
								new Token(')'.charCodeAt(0), ')')
					]
				parser_list = parser_list.concat(token_list);
				break;
			case 'B':
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'y'),
								new Token(IDENTIFIER, 'z'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'x'),
								new Token('('.charCodeAt(0), '('),
								new Token(IDENTIFIER, 'y'),
								new Token(IDENTIFIER, 'z'),  
								new Token(')'.charCodeAt(0), ')'),
								new Token(')'.charCodeAt(0), ')')
					]
				parser_list = parser_list.concat(token_list);
				break;
			case 'C':
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'y'),
								new Token(IDENTIFIER, 'z'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'z'),
								new Token(IDENTIFIER, 'y'),  
								new Token(')'.charCodeAt(0), ')')
					]
				parser_list = parser_list.concat(token_list);
				break;
			case 'W':
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'y'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'x'),
								new Token(IDENTIFIER, 'y'),
								new Token(IDENTIFIER, 'y'),  
								new Token(')'.charCodeAt(0), ')')
					]
				parser_list = parser_list.concat(token_list);
				break;
			case 'M':
				token_list = [  new Token('('.charCodeAt(0), '('), 
								new Token('\\'.charCodeAt(0), '\\'),
								new Token(IDENTIFIER, 'f'),
								new Token('.'.charCodeAt(0), '.'),
								new Token(IDENTIFIER, 'f'),
								new Token(IDENTIFIER, 'f'), 
								new Token(')'.charCodeAt(0), ')')
				]
				parser_list = parser_list.concat(token_list);
				break;
				case element.match(/[a-zA-Z]/)?.input:
					token = new Token(IDENTIFIER, element);
					parser_list.push(token); 
					break;
				case 'λ':
				case '\\':
					token = new Token('\\'.charCodeAt(0), '\\');
					parser_list.push(token); 
					break;
				case '.': 
					token = new Token('.'.charCodeAt(0), '.');
					parser_list.push(token); 
					break;
				case '(':
					token = new Token('('.charCodeAt(0), '(');
					parser_list.push(token); 
					break;
				case ')': 
					token = new Token(')'.charCodeAt(0), ')');
					parser_list.push(token); 
					break;
				case '[':
					token = new Token('['.charCodeAt(0), '\[');
					parser_list.push(token); 
					internal_flag = true;
					break;
				case ']':
					token = new Token(']'.charCodeAt(0), '\]');
					parser_list.push(token); 
					internal_flag = false;
					break;
			}
			index++;
		}
		return parser_list;
	}

	/**
	 * 
	 * @returns 
	 */
	function expression() {
		if (skip('\\'.charCodeAt(0))) {
			let parameter = null;
			if (next(IDENTIFIER)) {
				parameter = new Node(IDENTIFIER, token_list.shift().value, null);
			} else if (skip('['.charCodeAt(0))) {
				let internal_name = '';
				while (!skip(']'.charCodeAt(0))) {
					internal_name = internal_name + token_list.shift().value;
				}
				parameter = new Node(IDENTIFIER, '[' + internal_name + ']', null);
			} else {
				throw 'The parameter in lambda abstraction is not correct (PARAMETER NOT IDENTIFIER 326)';
			}
			
			if (!skip('.'.charCodeAt(0))) {
				if (next(IDENTIFIER)) {
					token_list.unshift(new Token('\\'.charCodeAt(0), '\\'));	
				} else {
					throw 'The argument in the lambda abstraction is not correct (ARGUMENT ERROR 334)';
				}
			}
			let expr = expression();
			return new Node(ABSTRACTION, parameter, expr);
		}
		return application();
	}
	
	/**
	 * 
	 * @returns 
	 */
	function application() {
		let left_child = atom();
		while (true) {
			let right_child = atom();
			if (left_child == null || right_child == undefined) {
				return left_child;
			}
			left_child = new Node(APPLICATION, left_child, right_child); 
		}
	}
	
	/**
	 * 
	 * @returns 
	 */
	function atom() {
		if (skip('('.charCodeAt(0))) {
			let expr = expression();
			match(')'.charCodeAt(0));
			if (expr == null) {
				return expression();
			}
			return expr;
		} else if (skip('['.charCodeAt(0))) {
			let internal_name = '';
			while (!skip(']'.charCodeAt(0))) {
				internal_name = internal_name + token_list.shift().value;
			}
			return new Node(IDENTIFIER, '[' + internal_name + ']', null);;
		} else if (next('\\'.charCodeAt(0))) {
			return expression();
		} else if (next(IDENTIFIER)) {
			return new Node(IDENTIFIER, token_list.shift().value, null);
		}
		return null;
	}
	
	/**
	 * 
	 * @param {*} term 
	 * @returns 
	 */
	function interpret(term) {
		
		if (term == null) {
			return null;
		}

		let prev = [];
		let stack = [];
		let prev_direction = [];
		
		stack.push(['RETURN', null]);
		stack.push([term.type, term, []]);
		
		while (stack.length) {
			
			let [ type, object, direction ] = stack.pop();
			
			switch (type) {
				
				case ABSTRACTION:
					if (!weak_lambda_calculus_flag) {
						stack.push(['VARIABLE_R', object, null]);
						stack.push([object.right.type, object.right, direction.concat(['R'])]);
					}
					break;
					
				case APPLICATION:
					stack.push(['COMPUTE', null, direction]);
					stack.push([object.right.type, clone(object.right), direction.concat(['R'])]);
					stack.push([object.left.type, clone(object.left), direction.concat(['L'])]);
					break;
				
				case 'VARIABLE_R':
					object.right = prev.pop();
					break;
					
				case 'COMPUTE':
					let term;
					let right_redex = prev.pop();
					let left_redex = prev.pop();
					prev.pop();
					if (left_redex.type == ABSTRACTION) {
						term = substitute(left_redex, left_redex.left, right_redex);
						stack.push([term.type, term, prev_direction.concat(direction)]);
						if (print_flag) {
							let [highlight_root, return_root] = highlight_substitution(term, direction);
							terminal_print(stringify(highlight_root) + ' ---> ' + stringify(return_root));
							original_AST = return_root;
						}
					} 
					else {				
						prev.push(new Node(APPLICATION, left_redex, right_redex));
					}				 
					break;
					
				case 'RETURN':
					return prev.pop();
				
			}	
			
			if (type == IDENTIFIER || type == ABSTRACTION || type == APPLICATION) {
				prev.push(object);	
			}

		}	
		return prev.pop();
	}
	
    return {
		// interpret - interpreter for generic lambda calculus terms
        interpret: function(command, parse_tree=false) {
			[ alpha_reduction_counter, substitution_counter ] = [ 0, 1 ];
			[ print_flag, weak_lambda_calculus_flag ] = [ true, false ];
			
			token_list = parser(command);
			let AST = expression();
			if (AST == null) throw 'Something went badly wrong!';
			original_AST = clone(AST);
		    $("form")[1]['tape'].value = convert_to_T_Brujin(AST); 
			let reduced_AST = interpret(AST);
			
			if (parse_tree) {
				return reduced_AST
			}
			
			return stringify(reduced_AST);
		},
		// interpret_TM - interpreter for TM
		interpret_TM : function(command, parse_tree=false) {
			var startTime = window.performance.now();
			[ alpha_reduction_counter, substitution_counter ] = [ 0, 1 ];
			[ print_flag, weak_lambda_calculus_flag ] = [ false, true ];
			
			let tape = command.substring(1);
			if (!GLOBAL_TURING_MACHINE_TO_LAMBDA_CALCULUS) throw 'T is undefined. Define and run a TURING MACHINE below first.';
			if (!tape) throw 'T has no tape. Enter a tape proceeding T (i.e., T1011)';
			
			let input_alphabet = get_input_alphabet(tape);
			
			[head_state, states, tape_alphabet, ruleset] = GLOBAL_TURING_MACHINE_TO_LAMBDA_CALCULUS;
		
			let I_M = initial_configuration_function(head_state, states, tape_alphabet, input_alphabet);
			let F_M = final_configuration_function(tape_alphabet, tape_alphabet);
			let [ T_M, state_pair ] = step_configuration_function(tape_alphabet, states, ruleset);
			
			// ------------------- I(M,Δ) & F(M,Δ) -------------------
			terminal_print('[[;white;black]------------ I(M,Δ) ------------]\n[[;white;black]I(M,Δ)] = ' + $.terminal.escape_formatting(I_M) + '\n[[;white;black]------------ F(M,Δ) ------------]\n[[;white;black]F(M,Δ)] = ' + $.terminal.escape_formatting(F_M) + '\n[[;white;black]-------------------STATES-------------------]');
			
			// ------------------- STATES -------------------
			for (let i = 1, l = state_pair.length + 1; i < l; i++) {
				terminal_print('[[;white;black]' + state_pair[i - 1][0] + '] = ' + $.terminal.escape_formatting(state_pair[i - 1][1]), false);
				if (i < l - 1) {
					terminal_print('\n[[;white;black]-------------------------]');
				}
			}
			
			// ------------------- FINAL CONFIGURATION -------------------
			terminal_print('\n[[;white;black]------------FINAL CONFIGURATION ------------]');
			token_list = parser('(' + 'λx.(' + T_M + '(' + I_M + 'x))' + ')' + finite_string_function(tape,  input_alphabet));
			let AST = expression();
			if (AST == null) throw 'Something went badly wrong!';
			original_AST = clone(AST);
			let final_configuration_string = stringify(interpret(AST));
			terminal_print('[[;white;black]FINAL CONFIGURATION = ]' + final_configuration_string);
			
			// ------------------- FINAL STATE  -------------------
			terminal_print('[[;white;black]------------FINAL STATE ------------]');
			token_list = parser(final_configuration_string.replaceAll('&#91;', '[').replaceAll('&#93;', ']') + '(\\w.\\x.\\y.\\z.z)');
			AST = expression();
			if (AST == null) throw 'Something went badly wrong!';
			original_AST = clone(AST);
			let final_state_string = stringify(interpret(AST));
			let index = parseInt(final_state_string.replaceAll('&#91;', '[').replaceAll('&#93;', ']').match(/\d+(?=\D*$)/)[0]) - 1;
			terminal_print('[[;white;black]FINAL STATE = ]' + states[index] + ' | ' + final_state_string);
	
			// ------------------ FINAL TAPE -------------------
			terminal_print('[[;white;black]------------FINAL TAPE------------]');
			token_list = parser(F_M + '(' + final_configuration_string.replaceAll('&#91;', '[').replaceAll('&#93;', ']') + ')');
			// token_list = parser('(' + 'λx.' + F_M + '(' + T_M + '(' + I_M + 'x))' + ')' + finite_string_function(tape, input_alphabet));
			AST = expression();
			if (AST == null) throw 'Something went badly wrong!';
			original_AST = clone(AST);
			let line = (stringify(interpret(AST))).replaceAll('&#91;', '[').replaceAll('&#93;', ']');
			console.log(window.performance.now() - startTime);
			return reverse_finite_string_function(line, tape_alphabet);
			
		},
		parse_tree: function(command, parse_tree=false) {
			[ alpha_reduction_counter, substitution_counter ] = [ 0, 1 ];
			[ print_flag, weak_lambda_calculus_flag ] = [ true, false ];

			token_list = parser(command);
			let AST = expression();
			if (AST == null) throw 'Something went badly wrong!';
			
			return AST;
		}	
	}
})();

const interpret = function interpret_function(command, bool=false) { return FOO.interpret(command, bool); }
const stringify = function stringify(AST) { return stringify_tree(AST); }
const convert_to_De_Brujin_function = function convert_to_De_Brujin_function(node) { return convert_to_De_Brujin(node); }					  
const interpret_TM = function interpret_TM_function(command, bool=false) { return FOO.interpret_TM(command, bool); }
const parse_tree =  function parse_tree(AST) { return FOO.parse_tree(AST); }
module.exports = {
	stringify,
	interpret,
	convert_to_De_Brujin_function,
	parse_tree
}