<?php
/**
 * @service ClientesCadastroJsonClient
 * @author omie
 */
class ClientesCadastroJsonClient {
	/**
	 * The WSDL URI
	 *
	 * @var string
	 */
	public static $_WsdlUri='https://app.omie.com.br/api/v1/geral/clientes/?WSDL';
	/**
	 * The PHP SoapClient object
	 *
	 * @var object
	 */
	public static $_Server=null;
	/**
	 * The endpoint URI
	 *
	 * @var string
	 */
	public static $_EndPoint='https://app.omie.com.br/api/v1/geral/clientes/';

	/**
	 * Send a SOAP request to the server
	 *
	 * @param string $method The method name
	 * @param array $param The parameters
	 * @return mixed The server response
	 */
	public static function _Call($method,$param){
		$call=["call"=>$method,"param"=>$param,"app_key"=>OMIE_APP_KEY,"app_secret"=>OMIE_APP_SECRET];
		$url = self::$_EndPoint;
		$body = json_encode($call);
		$opts = stream_context_create(["http" => ["method" => "POST", "header" => "Content-Type: application/json", "content" => $body ]]);
		$res = @file_get_contents($url, false, $opts);
		if (empty($res))
			throw new Exception("Error Processing Response: $res", 1);
		return json_decode($res);
	}

	/**
	 * Inclui o cliente no Omie
	 *
	 * @param clientes_cadastro $clientes_cadastro Cadastro reduzido de produtos
	 * @return clientes_status Status de retorno do cadastro de clientes.
	 */
	public function IncluirCliente($clientes_cadastro){
		return self::_Call('IncluirCliente',Array(
			$clientes_cadastro
		));
	}

	/**
	 * Altera os dados do cliente
	 *
	 * @param clientes_cadastro $clientes_cadastro Cadastro reduzido de produtos
	 * @return clientes_status Status de retorno do cadastro de clientes.
	 */
	public function AlterarCliente($clientes_cadastro){
		return self::_Call('AlterarCliente',Array(
			$clientes_cadastro
		));
	}

	/**
	 * Exclui um cliente da base de dados.
	 *
	 * @param clientes_cadastro_chave $clientes_cadastro_chave Chave para pesquisa do cadastro de clientes.
	 * @return clientes_status Status de retorno do cadastro de clientes.
	 */
	public function ExcluirCliente($clientes_cadastro_chave){
		return self::_Call('ExcluirCliente',Array(
			$clientes_cadastro_chave
		));
	}

	/**
	 * Consulta os dados de um cliente
	 *
	 * @param clientes_cadastro_chave $clientes_cadastro_chave Chave para pesquisa do cadastro de clientes.
	 * @return clientes_cadastro Cadastro reduzido de produtos
	 */
	public function ConsultarCliente($clientes_cadastro_chave){
		return self::_Call('ConsultarCliente',Array(
			$clientes_cadastro_chave
		));
	}

	/**
	 * Lista os clientes cadastrados
	 *
	 * @param clientes_list_request $clientes_list_request Lista os clientes cadastrados
	 * @return clientes_listfull_response Lista de clientes cadastrados no omie.
	 */
	public function ListarClientes($clientes_list_request){
		return self::_Call('ListarClientes',Array(
			$clientes_list_request
		));
	}

	/**
	 * Realiza pesquisa dos clientes
	 *
	 * @param clientes_list_request $clientes_list_request Lista os clientes cadastrados
	 * @return clientes_list_response Lista de clientes cadastrados no omie.
	 */
	public function ListarClientesResumido($clientes_list_request){
		return self::_Call('ListarClientesResumido',Array(
			$clientes_list_request
		));
	}

	/**
	 * DEPRECATED
	 *
	 * @param clientes_lote_request $clientes_lote_request Lote de cadastros de clientes para inclusão, limitado a 50 ocorrências por requisição.
	 * @return clientes_lote_response Resposta do processamento do lote de clientes cadastrados.
	 */
	public function IncluirClientesPorLote($clientes_lote_request){
		return self::_Call('IncluirClientesPorLote',Array(
			$clientes_lote_request
		));
	}

	/**
	 * Realiza o UPSERT da tabela de clientes (INCLUSÃO/ALTERAÇÃO).
	 *
	 * @param clientes_cadastro $clientes_cadastro Cadastro reduzido de produtos
	 * @return clientes_status Status de retorno do cadastro de clientes.
	 */
	public function UpsertCliente($clientes_cadastro){
		return self::_Call('UpsertCliente',Array(
			$clientes_cadastro
		));
	}

	/**
	 * DEPRECATED
	 *
	 * @param clientes_lote_request $clientes_lote_request Lote de cadastros de clientes para inclusão, limitado a 50 ocorrências por requisição.
	 * @return clientes_lote_response Resposta do processamento do lote de clientes cadastrados.
	 */
	public function UpsertClientesPorLote($clientes_lote_request){
		return self::_Call('UpsertClientesPorLote',Array(
			$clientes_lote_request
		));
	}

	/**
	 * Realiza o UPSERT da tabela de clientes (INCLUSÃO/ALTERAÇÃO) com base no CPF/CNPJ informado.
	 *
	 * @param clientes_cadastro $clientes_cadastro Cadastro reduzido de produtos
	 * @return clientes_status Status de retorno do cadastro de clientes.
	 */
	public function UpsertClienteCpfCnpj($clientes_cadastro){
		return self::_Call('UpsertClienteCpfCnpj',Array(
			$clientes_cadastro
		));
	}

	/**
	 * Associa um código de integração a um cliente cadastrado no Omie.
	 *
	 * @param clientes_cadastro_chave $clientes_cadastro_chave Chave para pesquisa do cadastro de clientes.
	 * @return clientes_status Status de retorno do cadastro de clientes.
	 */
	public function AssociarCodIntCliente($clientes_cadastro_chave){
		return self::_Call('AssociarCodIntCliente',Array(
			$clientes_cadastro_chave
		));
	}
}

/**
 * Características do cliente.
 *
 * @pw_element string $campo Nome da característica.<BR><BR>Preenchimento obrigatório. <BR>Caso não encontre a característica um novo cadastro será adicionado.
 * @pw_element string $conteudo Conteúdo do característica.<BR><BR>Preenchimento obrigatório na inclusão. <BR><BR>Caso o valor desse campo não seja informado a característica <BR>será excluída para o cliente/fornecedor.
 * @pw_complex caracteristicas
 */
class caracteristicas{
	/**
	 * Nome da característica.<BR><BR>Preenchimento obrigatório. <BR>Caso não encontre a característica um novo cadastro será adicionado.
	 *
	 * @var string
	 */
	public $campo;
	/**
	 * Conteúdo do característica.<BR><BR>Preenchimento obrigatório na inclusão. <BR><BR>Caso o valor desse campo não seja informado a característica <BR>será excluída para o cliente/fornecedor.
	 *
	 * @var string
	 */
	public $conteudo;
}


/**
 * Cadastro reduzido de produtos
 *
 * @pw_element integer $codigo_cliente_omie Código de Cliente / Fornecedor
 * @pw_element string $codigo_cliente_integracao Código de Integração com sistemas legados.
 * @pw_element string $razao_social Razão Social<BR>Preenchimento Obrigatório.
 * @pw_element string $cnpj_cpf CNPJ / CPF<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
 * @pw_element string $nome_fantasia Nome Fantasia<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
 * @pw_element string $telefone1_ddd DDD Telefone<BR>Preenchimento Opcional.
 * @pw_element string $telefone1_numero Telefone para Contato<BR>Preenchimento Opcional.
 * @pw_element string $contato Nome para contato<BR>Preenchimento Opcional.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $endereco Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $endereco_numero Número do Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.
 * @pw_element string $bairro Bairro<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $complemento Complemento para o Número do Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.
 * @pw_element string $estado Sigla do Estado<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "cSigla" do método "ListarEstados" da API<BR>http://app.omie.com.br/api/v1/geral/estados/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltro".
 * @pw_element string $cidade Código da Cidade<BR>Recebe o código ibge ou o nome da cidade.<BR><BR>Preenchimento Opcional caso seja enviado o codigo IBGE no campo "cidade_ibge"<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "nCodIBGE" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>Utilize a tag "cCod" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $cep CEP<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $codigo_pais Código do País<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize as tags "cCodigo","cDescricao" ou "cCodigoISO" do método "ListarPaises" da API<BR>http://app.omie.com.br/api/v1/geral/paises/<BR>para obter essa informação.
 * @pw_element string $separar_endereco Separar endereço. <BR>Valores possível S ou N, sendo N o padrão.<BR>Quando igual S separa do endereço o número o e complemento, caso existirem.
 * @pw_element string $pesquisar_cep Pesquisar CEP.<BR>Valores possível S ou N, sendo N o padrão.<BR><BR>Quando igual a S o sistema irá preencher os campos do endereço que estiverem vazios (logradouro, bairro e cidade) conforme os dados do CEP
 * @pw_element string $telefone2_ddd DDD Telefone 2<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
 * @pw_element string $telefone2_numero Telefone 2<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
 * @pw_element string $fax_ddd DDD Fax<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
 * @pw_element string $fax_numero Fax<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
 * @pw_element string $email E-Mail<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $homepage WebSite<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inscricao_estadual Inscrição Estadual<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inscricao_municipal Inscrição Municipal<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inscricao_suframa Inscrição Suframa<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $optante_simples_nacional Indica se o Cliente / Fornecedor é Optante do Simples Nacional <BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $tipo_atividade Tipo da Atividade<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>Utilize a tag "cCodigo" do método "ListarTipoAtiv" da API<BR>http://app.omie.com.br/api/v1/geral/tpativ/<BR>para obter essa informação.
 * @pw_element string $cnae Código do CNAE - Fiscal<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>Utilize a tag "nCodigo" do método "ListarCNAE" da API<BR>http://app.omie.com.br/api/v1/produtos/cnae/<BR>para obter essa informação.
 * @pw_element string $produtor_rural Indica se o Cliente / Fornecedor é um Produtor Rural<BR>Preenchimento Opcional.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
 * @pw_element string $contribuinte Indica se o cliente é contribuinte (S/N).<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
 * @pw_element string $observacao Observações Internas<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
 * @pw_element string $obs_detalhadas Observações Detalhadas.<BR><BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
 * @pw_element string $recomendacao_atraso Código da Instrução de Protesto<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Recomendações" do cadastro do Cliente.
 * @pw_element tagsArray $tags Tags do Cliente ou Fornecedor<BR>Preenchimento Opcional.
 * @pw_element string $pessoa_fisica Pessoa Física<BR>Preenchimento automático - Não informar.<BR><BR>Informar "S" ou "N".<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $exterior Indica que é um tomador de serviço localizado no exterior<BR>Preenchimento automático - Não informar.<BR><BR>Informar "S" ou "N".
 * @pw_element string $logradouro DEPRECATED
 * @pw_element string $importado_api Importado pela API (S/N).
 * @pw_element string $bloqueado DEPRECATED
 * @pw_element string $cidade_ibge Código do IBGE para a Cidade.<BR><BR>Preenchimento Opcional caso seja enviado o nome da cidade no campo "cidade"<BR><BR>Utilize a tag "nCodIBGE" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.
 * @pw_element decimal $valor_limite_credito Valor do Limite de Crédito Total.<BR><BR>Preenchimento opcional.
 * @pw_element string $bloquear_faturamento Bloquear o faturamento para o cliente (S/N).<BR><BR>Preenchimento opcional.
 * @pw_element recomendacoes $recomendacoes Recomendações do cliente.
 * @pw_element enderecoEntrega $enderecoEntrega Dados do Endereço de Entrega.
 * @pw_element string $nif NIF - Número de Identificação Fiscal.<BR><BR>Apenas para estrangeiros.
 * @pw_element string $documento_exterior Documento no exterior para clientes estrangeiros.
 * @pw_element string $inativo Indica se o cliente está inativo [S/N]
 * @pw_element dadosBancarios $dadosBancarios Dados Bancários do cliente.
 * @pw_element caracteristicasArray $caracteristicas Características do cliente.
 * @pw_element string $enviar_anexos Enviar anexos por e-mail (S/N).<BR><BR>Valores possíveis S ou N, sendo N o padrão.<BR><BR>Enviar anexos por e-mail além do link para o Portal Omie para o cliente cadastrado.<BR><BR>Esta função só poderá ser utilizada se o Portal Omie estiver ativo.
 * @pw_element info $info Informações sobre o cadastro do cliente.
 * @pw_element string $bloquear_exclusao Bloqueia a exclusão do registro. (S/N)
 * @pw_complex clientes_cadastro
 */
class clientes_cadastro{
	/**
	 * Código de Cliente / Fornecedor
	 *
	 * @var integer
	 */
	public $codigo_cliente_omie;
	/**
	 * Código de Integração com sistemas legados.
	 *
	 * @var string
	 */
	public $codigo_cliente_integracao;
	/**
	 * Razão Social<BR>Preenchimento Obrigatório.
	 *
	 * @var string
	 */
	public $razao_social;
	/**
	 * CNPJ / CPF<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
	 *
	 * @var string
	 */
	public $cnpj_cpf;
	/**
	 * Nome Fantasia<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
	 *
	 * @var string
	 */
	public $nome_fantasia;
	/**
	 * DDD Telefone<BR>Preenchimento Opcional.
	 *
	 * @var string
	 */
	public $telefone1_ddd;
	/**
	 * Telefone para Contato<BR>Preenchimento Opcional.
	 *
	 * @var string
	 */
	public $telefone1_numero;
	/**
	 * Nome para contato<BR>Preenchimento Opcional.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $contato;
	/**
	 * Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $endereco;
	/**
	 * Número do Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $endereco_numero;
	/**
	 * Bairro<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $bairro;
	/**
	 * Complemento para o Número do Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $complemento;
	/**
	 * Sigla do Estado<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "cSigla" do método "ListarEstados" da API<BR>http://app.omie.com.br/api/v1/geral/estados/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltro".
	 *
	 * @var string
	 */
	public $estado;
	/**
	 * Código da Cidade<BR>Recebe o código ibge ou o nome da cidade.<BR><BR>Preenchimento Opcional caso seja enviado o codigo IBGE no campo "cidade_ibge"<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "nCodIBGE" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>Utilize a tag "cCod" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $cidade;
	/**
	 * CEP<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $cep;
	/**
	 * Código do País<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize as tags "cCodigo","cDescricao" ou "cCodigoISO" do método "ListarPaises" da API<BR>http://app.omie.com.br/api/v1/geral/paises/<BR>para obter essa informação.
	 *
	 * @var string
	 */
	public $codigo_pais;
	/**
	 * Separar endereço. <BR>Valores possível S ou N, sendo N o padrão.<BR>Quando igual S separa do endereço o número o e complemento, caso existirem.
	 *
	 * @var string
	 */
	public $separar_endereco;
	/**
	 * Pesquisar CEP.<BR>Valores possível S ou N, sendo N o padrão.<BR><BR>Quando igual a S o sistema irá preencher os campos do endereço que estiverem vazios (logradouro, bairro e cidade) conforme os dados do CEP
	 *
	 * @var string
	 */
	public $pesquisar_cep;
	/**
	 * DDD Telefone 2<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $telefone2_ddd;
	/**
	 * Telefone 2<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $telefone2_numero;
	/**
	 * DDD Fax<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $fax_ddd;
	/**
	 * Fax<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $fax_numero;
	/**
	 * E-Mail<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $email;
	/**
	 * WebSite<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $homepage;
	/**
	 * Inscrição Estadual<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $inscricao_estadual;
	/**
	 * Inscrição Municipal<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $inscricao_municipal;
	/**
	 * Inscrição Suframa<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $inscricao_suframa;
	/**
	 * Indica se o Cliente / Fornecedor é Optante do Simples Nacional <BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $optante_simples_nacional;
	/**
	 * Tipo da Atividade<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>Utilize a tag "cCodigo" do método "ListarTipoAtiv" da API<BR>http://app.omie.com.br/api/v1/geral/tpativ/<BR>para obter essa informação.
	 *
	 * @var string
	 */
	public $tipo_atividade;
	/**
	 * Código do CNAE - Fiscal<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>Utilize a tag "nCodigo" do método "ListarCNAE" da API<BR>http://app.omie.com.br/api/v1/produtos/cnae/<BR>para obter essa informação.
	 *
	 * @var string
	 */
	public $cnae;
	/**
	 * Indica se o Cliente / Fornecedor é um Produtor Rural<BR>Preenchimento Opcional.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $produtor_rural;
	/**
	 * Indica se o cliente é contribuinte (S/N).<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $contribuinte;
	/**
	 * Observações Internas<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $observacao;
	/**
	 * Observações Detalhadas.<BR><BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $obs_detalhadas;
	/**
	 * Código da Instrução de Protesto<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Recomendações" do cadastro do Cliente.
	 *
	 * @var string
	 */
	public $recomendacao_atraso;
	/**
	 * Tags do Cliente ou Fornecedor<BR>Preenchimento Opcional.
	 *
	 * @var tagsArray
	 */
	public $tags;
	/**
	 * Pessoa Física<BR>Preenchimento automático - Não informar.<BR><BR>Informar "S" ou "N".<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $pessoa_fisica;
	/**
	 * Indica que é um tomador de serviço localizado no exterior<BR>Preenchimento automático - Não informar.<BR><BR>Informar "S" ou "N".
	 *
	 * @var string
	 */
	public $exterior;
	/**
	 * DEPRECATED
	 *
	 * @var string
	 */
	public $logradouro;
	/**
	 * Importado pela API (S/N).
	 *
	 * @var string
	 */
	public $importado_api;
	/**
	 * DEPRECATED
	 *
	 * @var string
	 */
	public $bloqueado;
	/**
	 * Código do IBGE para a Cidade.<BR><BR>Preenchimento Opcional caso seja enviado o nome da cidade no campo "cidade"<BR><BR>Utilize a tag "nCodIBGE" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.
	 *
	 * @var string
	 */
	public $cidade_ibge;
	/**
	 * Valor do Limite de Crédito Total.<BR><BR>Preenchimento opcional.
	 *
	 * @var decimal
	 */
	public $valor_limite_credito;
	/**
	 * Bloquear o faturamento para o cliente (S/N).<BR><BR>Preenchimento opcional.
	 *
	 * @var string
	 */
	public $bloquear_faturamento;
	/**
	 * Recomendações do cliente.
	 *
	 * @var recomendacoes
	 */
	public $recomendacoes;
	/**
	 * Dados do Endereço de Entrega.
	 *
	 * @var enderecoEntrega
	 */
	public $enderecoEntrega;
	/**
	 * NIF - Número de Identificação Fiscal.<BR><BR>Apenas para estrangeiros.
	 *
	 * @var string
	 */
	public $nif;
	/**
	 * Documento no exterior para clientes estrangeiros.
	 *
	 * @var string
	 */
	public $documento_exterior;
	/**
	 * Indica se o cliente está inativo [S/N]
	 *
	 * @var string
	 */
	public $inativo;
	/**
	 * Dados Bancários do cliente.
	 *
	 * @var dadosBancarios
	 */
	public $dadosBancarios;
	/**
	 * Características do cliente.
	 *
	 * @var caracteristicasArray
	 */
	public $caracteristicas;
	/**
	 * Enviar anexos por e-mail (S/N).<BR><BR>Valores possíveis S ou N, sendo N o padrão.<BR><BR>Enviar anexos por e-mail além do link para o Portal Omie para o cliente cadastrado.<BR><BR>Esta função só poderá ser utilizada se o Portal Omie estiver ativo.
	 *
	 * @var string
	 */
	public $enviar_anexos;
	/**
	 * Informações sobre o cadastro do cliente.
	 *
	 * @var info
	 */
	public $info;
	/**
	 * Bloqueia a exclusão do registro. (S/N)
	 *
	 * @var string
	 */
	public $bloquear_exclusao;
}


/**
 * Tags do Cliente ou Fornecedor
 *
 * @pw_element string $tag Tag do Cliente ou Fornecedor
 * @pw_complex tags
 */
class tags{
	/**
	 * Tag do Cliente ou Fornecedor
	 *
	 * @var string
	 */
	public $tag;
}


/**
 * Recomendações do cliente.
 *
 * @pw_element string $numero_parcelas Número de Parcelas padrão para as Vendas.
 * @pw_element integer $codigo_vendedor Código do Vendedor padrão.
 * @pw_element string $email_fatura Enviar a NF-e e Boleto para outro e-mail?
 * @pw_element string $gerar_boletos Por padrão: Gerar Boletos ao Emitir NF-e?
 * @pw_element integer $codigo_transportadora Código da Transportadora padrão.
 * @pw_element string $tipo_assinante Tipo de Assinante utilizado para notas fiscais via única (modelo 21 e 22).<BR><BR>Utilize a tag "cCodigo" do método "ListarTipoAssinante" da API<BR>/api/v1/geral/tipoassinante/ para obter essa informação.
 * @pw_complex recomendacoes
 */
class recomendacoes{
	/**
	 * Número de Parcelas padrão para as Vendas.
	 *
	 * @var string
	 */
	public $numero_parcelas;
	/**
	 * Código do Vendedor padrão.
	 *
	 * @var integer
	 */
	public $codigo_vendedor;
	/**
	 * Enviar a NF-e e Boleto para outro e-mail?
	 *
	 * @var string
	 */
	public $email_fatura;
	/**
	 * Por padrão: Gerar Boletos ao Emitir NF-e?
	 *
	 * @var string
	 */
	public $gerar_boletos;
	/**
	 * Código da Transportadora padrão.
	 *
	 * @var integer
	 */
	public $codigo_transportadora;
	/**
	 * Tipo de Assinante utilizado para notas fiscais via única (modelo 21 e 22).<BR><BR>Utilize a tag "cCodigo" do método "ListarTipoAssinante" da API<BR>/api/v1/geral/tipoassinante/ para obter essa informação.
	 *
	 * @var string
	 */
	public $tipo_assinante;
}

/**
 * Dados do Endereço de Entrega.
 *
 * @pw_element string $entRazaoSocial Nome / Razão Social
 * @pw_element string $entCnpjCpf CNPJ / CPF do recebedor.
 * @pw_element string $entEndereco Endereço.
 * @pw_element string $entNumero Número do endereço.
 * @pw_element string $entComplemento Complemento do endereço.
 * @pw_element string $entBairro Bairro.
 * @pw_element string $entCEP CEP
 * @pw_element string $entEstado Estado.
 * @pw_element string $entCidade Cidade
 * @pw_element string $entSepararEndereco Separar endereço. <BR>Valores possível S ou N, sendo N o padrão.<BR>Quando igual S separa do endereço o número o e complemento, caso existirem.
 * @pw_element string $entTelefone Telefone
 * @pw_element string $entIE Inscrição Estadual
 * @pw_complex enderecoEntrega
 */
class enderecoEntrega{
	/**
	 * Nome / Razão Social
	 *
	 * @var string
	 */
	public $entRazaoSocial;
	/**
	 * CNPJ / CPF do recebedor.
	 *
	 * @var string
	 */
	public $entCnpjCpf;
	/**
	 * Endereço.
	 *
	 * @var string
	 */
	public $entEndereco;
	/**
	 * Número do endereço.
	 *
	 * @var string
	 */
	public $entNumero;
	/**
	 * Complemento do endereço.
	 *
	 * @var string
	 */
	public $entComplemento;
	/**
	 * Bairro.
	 *
	 * @var string
	 */
	public $entBairro;
	/**
	 * CEP
	 *
	 * @var string
	 */
	public $entCEP;
	/**
	 * Estado.
	 *
	 * @var string
	 */
	public $entEstado;
	/**
	 * Cidade
	 *
	 * @var string
	 */
	public $entCidade;
	/**
	 * Separar endereço. <BR>Valores possível S ou N, sendo N o padrão.<BR>Quando igual S separa do endereço o número o e complemento, caso existirem.
	 *
	 * @var string
	 */
	public $entSepararEndereco;
	/**
	 * Telefone
	 *
	 * @var string
	 */
	public $entTelefone;
	/**
	 * Inscrição Estadual
	 *
	 * @var string
	 */
	public $entIE;
}

/**
 * Dados Bancários do cliente.
 *
 * @pw_element string $codigo_banco Código do Banco.
 * @pw_element string $agencia Agência
 * @pw_element string $conta_corrente Número da Conta Corrente.
 * @pw_element string $doc_titular CNPJ ou CPF do titular.
 * @pw_element string $nome_titular Nome do titular.
 * @pw_element string $transf_padrao Definir transferência como forma de pagamento padrão<BR><BR>Pode ser:<BR>"S" para SIM<BR>"N" para NÃO
 * @pw_element string $cChavePix Chave PIX.
 * @pw_complex dadosBancarios
 */
class dadosBancarios{
	/**
	 * Código do Banco.
	 *
	 * @var string
	 */
	public $codigo_banco;
	/**
	 * Agência
	 *
	 * @var string
	 */
	public $agencia;
	/**
	 * Número da Conta Corrente.
	 *
	 * @var string
	 */
	public $conta_corrente;
	/**
	 * CNPJ ou CPF do titular.
	 *
	 * @var string
	 */
	public $doc_titular;
	/**
	 * Nome do titular.
	 *
	 * @var string
	 */
	public $nome_titular;
	/**
	 * Definir transferência como forma de pagamento padrão<BR><BR>Pode ser:<BR>"S" para SIM<BR>"N" para NÃO
	 *
	 * @var string
	 */
	public $transf_padrao;
	/**
	 * Chave PIX.
	 *
	 * @var string
	 */
	public $cChavePix;
}

/**
 * Informações sobre o cadastro do cliente.
 *
 * @pw_element string $dInc Data da Inclusão.<BR>No formato dd/mm/aaaa.
 * @pw_element string $hInc Hora da Inclusão.<BR>No formato hh:mm:ss.
 * @pw_element string $uInc Usuário da Inclusão.
 * @pw_element string $dAlt Data da Alteração.<BR>No formato dd/mm/aaaa.
 * @pw_element string $hAlt Hora da Alteração.<BR>No formato hh:mm:ss.
 * @pw_element string $uAlt Usuário da Alteração.
 * @pw_element string $cImpAPI Importado pela API (S/N).
 * @pw_complex info
 */
class info{
	/**
	 * Data da Inclusão.<BR>No formato dd/mm/aaaa.
	 *
	 * @var string
	 */
	public $dInc;
	/**
	 * Hora da Inclusão.<BR>No formato hh:mm:ss.
	 *
	 * @var string
	 */
	public $hInc;
	/**
	 * Usuário da Inclusão.
	 *
	 * @var string
	 */
	public $uInc;
	/**
	 * Data da Alteração.<BR>No formato dd/mm/aaaa.
	 *
	 * @var string
	 */
	public $dAlt;
	/**
	 * Hora da Alteração.<BR>No formato hh:mm:ss.
	 *
	 * @var string
	 */
	public $hAlt;
	/**
	 * Usuário da Alteração.
	 *
	 * @var string
	 */
	public $uAlt;
	/**
	 * Importado pela API (S/N).
	 *
	 * @var string
	 */
	public $cImpAPI;
}

/**
 * Chave para pesquisa do cadastro de clientes.
 *
 * @pw_element integer $codigo_cliente_omie Código de Cliente / Fornecedor
 * @pw_element string $codigo_cliente_integracao Código de Integração com sistemas legados.
 * @pw_complex clientes_cadastro_chave
 */
class clientes_cadastro_chave{
	/**
	 * Código de Cliente / Fornecedor
	 *
	 * @var integer
	 */
	public $codigo_cliente_omie;
	/**
	 * Código de Integração com sistemas legados.
	 *
	 * @var string
	 */
	public $codigo_cliente_integracao;
}

/**
 * Cadastro reduzido de clientes.
 *
 * @pw_element integer $codigo_cliente Código de Cliente / Fornecedor
 * @pw_element string $codigo_cliente_integracao Código de Integração com sistemas legados.
 * @pw_element string $razao_social Razão Social<BR>Preenchimento Obrigatório.
 * @pw_element string $nome_fantasia Nome Fantasia<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
 * @pw_element string $cnpj_cpf CNPJ / CPF<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
 * @pw_complex clientes_cadastro_resumido
 */
class clientes_cadastro_resumido{
	/**
	 * Código de Cliente / Fornecedor
	 *
	 * @var integer
	 */
	public $codigo_cliente;
	/**
	 * Código de Integração com sistemas legados.
	 *
	 * @var string
	 */
	public $codigo_cliente_integracao;
	/**
	 * Razão Social<BR>Preenchimento Obrigatório.
	 *
	 * @var string
	 */
	public $razao_social;
	/**
	 * Nome Fantasia<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
	 *
	 * @var string
	 */
	public $nome_fantasia;
	/**
	 * CNPJ / CPF<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
	 *
	 * @var string
	 */
	public $cnpj_cpf;
}


/**
 * Lista os clientes cadastrados
 *
 * @pw_element integer $pagina Número da página retornada
 * @pw_element integer $registros_por_pagina Número de registros retornados na página.
 * @pw_element string $apenas_importado_api Exibir apenas os registros gerados pela API
 * @pw_element string $ordenar_por DEPRECATED
 * @pw_element string $ordem_decrescente DEPRECATED
 * @pw_element string $filtrar_por_data_de Filtrar os registros a partir de uma data.
 * @pw_element string $filtrar_por_data_ate Filtrar os registros até uma data.
 * @pw_element string $filtrar_por_hora_de Filtro por hora a apartir de.
 * @pw_element string $filtrar_por_hora_ate Filtro por hora até.
 * @pw_element string $filtrar_apenas_inclusao Filtrar apenas os registros incluídos.
 * @pw_element string $filtrar_apenas_alteracao Filtrar apenas os registros alterados.
 * @pw_element clientesFiltro $clientesFiltro Filtrar cadastro de clientes&nbsp;&nbsp;
 * @pw_element clientesPorCodigoArray $clientesPorCodigo Lista de Códigos para filtro de clientes
 * @pw_element string $exibir_caracteristicas Exibe as caracteristicas do cliente.
 * @pw_element string $exibir_obs Exibir as observações do cliente (S/N).<BR><BR>Preenchimento Opcional.<BR><BR>Preencher com "S" ou "N".<BR><BR>Default "N"
 * @pw_element string $ordem_descrescente DEPRECATED
 * @pw_complex clientes_list_request
 */
class clientes_list_request{
	/**
	 * Número da página retornada
	 *
	 * @var integer
	 */
	public $pagina;
	/**
	 * Número de registros retornados na página.
	 *
	 * @var integer
	 */
	public $registros_por_pagina;
	/**
	 * Exibir apenas os registros gerados pela API
	 *
	 * @var string
	 */
	public $apenas_importado_api;
	/**
	 * DEPRECATED
	 *
	 * @var string
	 */
	public $ordenar_por;
	/**
	 * DEPRECATED
	 *
	 * @var string
	 */
	public $ordem_decrescente;
	/**
	 * Filtrar os registros a partir de uma data.
	 *
	 * @var string
	 */
	public $filtrar_por_data_de;
	/**
	 * Filtrar os registros até uma data.
	 *
	 * @var string
	 */
	public $filtrar_por_data_ate;
	/**
	 * Filtro por hora a apartir de.
	 *
	 * @var string
	 */
	public $filtrar_por_hora_de;
	/**
	 * Filtro por hora até.
	 *
	 * @var string
	 */
	public $filtrar_por_hora_ate;
	/**
	 * Filtrar apenas os registros incluídos.
	 *
	 * @var string
	 */
	public $filtrar_apenas_inclusao;
	/**
	 * Filtrar apenas os registros alterados.
	 *
	 * @var string
	 */
	public $filtrar_apenas_alteracao;
	/**
	 * Filtrar cadastro de clientes&nbsp;&nbsp;
	 *
	 * @var clientesFiltro
	 */
	public $clientesFiltro;
	/**
	 * Lista de Códigos para filtro de clientes
	 *
	 * @var clientesPorCodigoArray
	 */
	public $clientesPorCodigo;
	/**
	 * Exibe as caracteristicas do cliente.
	 *
	 * @var string
	 */
	public $exibir_caracteristicas;
	/**
	 * Exibir as observações do cliente (S/N).<BR><BR>Preenchimento Opcional.<BR><BR>Preencher com "S" ou "N".<BR><BR>Default "N"
	 *
	 * @var string
	 */
	public $exibir_obs;
	/**
	 * DEPRECATED
	 *
	 * @var string
	 */
	public $ordem_descrescente;
}

/**
 * Filtrar cadastro de clientes
 *
 * @pw_element integer $codigo_cliente_omie Código de Cliente / Fornecedor
 * @pw_element string $codigo_cliente_integracao Código de Integração com sistemas legados.
 * @pw_element string $cnpj_cpf CNPJ / CPF<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
 * @pw_element string $razao_social Razão Social<BR>Preenchimento Obrigatório.
 * @pw_element string $nome_fantasia Nome Fantasia<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
 * @pw_element string $endereco Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $bairro Bairro<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $cidade Código da Cidade<BR>Recebe o código ibge ou o nome da cidade.<BR><BR>Preenchimento Opcional caso seja enviado o codigo IBGE no campo "cidade_ibge"<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "nCodIBGE" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>Utilize a tag "cCod" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $estado Sigla do Estado<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "cSigla" do método "ListarEstados" da API<BR>http://app.omie.com.br/api/v1/geral/estados/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltro".
 * @pw_element string $cep CEP<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $contato Nome para contato<BR>Preenchimento Opcional.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $email E-Mail<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $homepage WebSite<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inscricao_municipal Inscrição Municipal<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inscricao_estadual Inscrição Estadual<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inscricao_suframa Inscrição Suframa<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $pessoa_fisica Pessoa Física<BR>Preenchimento automático - Não informar.<BR><BR>Informar "S" ou "N".<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $optante_simples_nacional Indica se o Cliente / Fornecedor é Optante do Simples Nacional <BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
 * @pw_element string $inativo Indica se o cliente está inativo [S/N]
 * @pw_element tagsArray $tags Tags do Cliente ou Fornecedor<BR>Preenchimento Opcional.
 * @pw_complex clientesFiltro
 */
class clientesFiltro{
	/**
	 * Código de Cliente / Fornecedor
	 *
	 * @var integer
	 */
	public $codigo_cliente_omie;
	/**
	 * Código de Integração com sistemas legados.
	 *
	 * @var string
	 */
	public $codigo_cliente_integracao;
	/**
	 * CNPJ / CPF<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
	 *
	 * @var string
	 */
	public $cnpj_cpf;
	/**
	 * Razão Social<BR>Preenchimento Obrigatório.
	 *
	 * @var string
	 */
	public $razao_social;
	/**
	 * Nome Fantasia<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.
	 *
	 * @var string
	 */
	public $nome_fantasia;
	/**
	 * Endereço<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $endereco;
	/**
	 * Bairro<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $bairro;
	/**
	 * Código da Cidade<BR>Recebe o código ibge ou o nome da cidade.<BR><BR>Preenchimento Opcional caso seja enviado o codigo IBGE no campo "cidade_ibge"<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "nCodIBGE" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>Utilize a tag "cCod" do método "PesquisarCidades" da API<BR>/api/v1/geral/cidades/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $cidade;
	/**
	 * Sigla do Estado<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>Utilize a tag "cSigla" do método "ListarEstados" da API<BR>http://app.omie.com.br/api/v1/geral/estados/<BR>para obter essa informação.<BR><BR>DEPRECATED para a estrutura "clientesFiltro".
	 *
	 * @var string
	 */
	public $estado;
	/**
	 * CEP<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Endereço" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $cep;
	/**
	 * Nome para contato<BR>Preenchimento Opcional.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $contato;
	/**
	 * E-Mail<BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $email;
	/**
	 * WebSite<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Telefones e E-mail" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $homepage;
	/**
	 * Inscrição Municipal<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $inscricao_municipal;
	/**
	 * Inscrição Estadual<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $inscricao_estadual;
	/**
	 * Inscrição Suframa<BR>Preenchimento Opcional.<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $inscricao_suframa;
	/**
	 * Pessoa Física<BR>Preenchimento automático - Não informar.<BR><BR>Informar "S" ou "N".<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $pessoa_fisica;
	/**
	 * Indica se o Cliente / Fornecedor é Optante do Simples Nacional <BR>Preenchimento Opcional.<BR>Preenchimento Obrigatório para emissão de NF-e/NFS-e.<BR><BR>Informar "S" ou "N".<BR><BR>Informação localizada na Aba "Inscrições CNAE e Outros" do cadastro do Cliente.<BR><BR>DEPRECATED para a estrutura "clientesFiltrar".
	 *
	 * @var string
	 */
	public $optante_simples_nacional;
	/**
	 * Indica se o cliente está inativo [S/N]
	 *
	 * @var string
	 */
	public $inativo;
	/**
	 * Tags do Cliente ou Fornecedor<BR>Preenchimento Opcional.
	 *
	 * @var tagsArray
	 */
	public $tags;
}

/**
 * Lista de Códigos para filtro de clientes
 *
 * @pw_element integer $codigo_cliente_omie Código de Cliente / Fornecedor
 * @pw_element string $codigo_cliente_integracao Código de Integração com sistemas legados.
 * @pw_complex clientesPorCodigo
 */
class clientesPorCodigo{
	/**
	 * Código de Cliente / Fornecedor
	 *
	 * @var integer
	 */
	public $codigo_cliente_omie;
	/**
	 * Código de Integração com sistemas legados.
	 *
	 * @var string
	 */
	public $codigo_cliente_integracao;
}


/**
 * Lista de clientes cadastrados no omie.
 *
 * @pw_element integer $pagina Número da página retornada
 * @pw_element integer $total_de_paginas Número total de páginas
 * @pw_element integer $registros Número de registros retornados na página.
 * @pw_element integer $total_de_registros total de registros encontrados
 * @pw_element clientes_cadastro_resumidoArray $clientes_cadastro_resumido Cadastro reduzido de clientes.
 * @pw_complex clientes_list_response
 */
class clientes_list_response{
	/**
	 * Número da página retornada
	 *
	 * @var integer
	 */
	public $pagina;
	/**
	 * Número total de páginas
	 *
	 * @var integer
	 */
	public $total_de_paginas;
	/**
	 * Número de registros retornados na página.
	 *
	 * @var integer
	 */
	public $registros;
	/**
	 * total de registros encontrados
	 *
	 * @var integer
	 */
	public $total_de_registros;
	/**
	 * Cadastro reduzido de clientes.
	 *
	 * @var clientes_cadastro_resumidoArray
	 */
	public $clientes_cadastro_resumido;
}

/**
 * Lista de clientes cadastrados no omie.
 *
 * @pw_element integer $pagina Número da página retornada
 * @pw_element integer $total_de_paginas Número total de páginas
 * @pw_element integer $registros Número de registros retornados na página.
 * @pw_element integer $total_de_registros total de registros encontrados
 * @pw_element clientes_cadastroArray $clientes_cadastro Cadastro reduzido de produtos
 * @pw_complex clientes_listfull_response
 */
class clientes_listfull_response{
	/**
	 * Número da página retornada
	 *
	 * @var integer
	 */
	public $pagina;
	/**
	 * Número total de páginas
	 *
	 * @var integer
	 */
	public $total_de_paginas;
	/**
	 * Número de registros retornados na página.
	 *
	 * @var integer
	 */
	public $registros;
	/**
	 * total de registros encontrados
	 *
	 * @var integer
	 */
	public $total_de_registros;
	/**
	 * Cadastro reduzido de produtos
	 *
	 * @var clientes_cadastroArray
	 */
	public $clientes_cadastro;
}

/**
 * Lote de cadastros de clientes para inclusão, limitado a 50 ocorrências por requisição.
 *
 * @pw_element integer $lote Número do lote
 * @pw_element clientes_cadastroArray $clientes_cadastro Cadastro reduzido de produtos
 * @pw_complex clientes_lote_request
 */
class clientes_lote_request{
	/**
	 * Número do lote
	 *
	 * @var integer
	 */
	public $lote;
	/**
	 * Cadastro reduzido de produtos
	 *
	 * @var clientes_cadastroArray
	 */
	public $clientes_cadastro;
}

/**
 * Resposta do processamento do lote de clientes cadastrados.
 *
 * @pw_element integer $lote Número do lote
 * @pw_element string $codigo_status Código do status do processamento.<BR>Se o retorno for '0' significa que a solicitação foi executada com sucesso.<BR>Se o retorno for maior que '0' ocorreu algum erro durante o processamento da solicitação.<BR>A tag 'cDesStatus' descreve o problema ocorrido.
 * @pw_element string $descricao_status Descrição do status do processamento.<BR>Essa tag explica o resultado da tag 'cCodigoStatus'.
 * @pw_complex clientes_lote_response
 */
class clientes_lote_response{
	/**
	 * Número do lote
	 *
	 * @var integer
	 */
	public $lote;
	/**
	 * Código do status do processamento.<BR>Se o retorno for '0' significa que a solicitação foi executada com sucesso.<BR>Se o retorno for maior que '0' ocorreu algum erro durante o processamento da solicitação.<BR>A tag 'cDesStatus' descreve o problema ocorrido.
	 *
	 * @var string
	 */
	public $codigo_status;
	/**
	 * Descrição do status do processamento.<BR>Essa tag explica o resultado da tag 'cCodigoStatus'.
	 *
	 * @var string
	 */
	public $descricao_status;
}

/**
 * Status de retorno do cadastro de clientes.
 *
 * @pw_element integer $codigo_cliente_omie Código de Cliente / Fornecedor
 * @pw_element string $codigo_cliente_integracao Código de Integração com sistemas legados.
 * @pw_element string $codigo_status Código do status do processamento.<BR>Se o retorno for '0' significa que a solicitação foi executada com sucesso.<BR>Se o retorno for maior que '0' ocorreu algum erro durante o processamento da solicitação.<BR>A tag 'cDesStatus' descreve o problema ocorrido.
 * @pw_element string $descricao_status Descrição do status do processamento.<BR>Essa tag explica o resultado da tag 'cCodigoStatus'.
 * @pw_complex clientes_status
 */
class clientes_status{
	/**
	 * Código de Cliente / Fornecedor
	 *
	 * @var integer
	 */
	public $codigo_cliente_omie;
	/**
	 * Código de Integração com sistemas legados.
	 *
	 * @var string
	 */
	public $codigo_cliente_integracao;
	/**
	 * Código do status do processamento.<BR>Se o retorno for '0' significa que a solicitação foi executada com sucesso.<BR>Se o retorno for maior que '0' ocorreu algum erro durante o processamento da solicitação.<BR>A tag 'cDesStatus' descreve o problema ocorrido.
	 *
	 * @var string
	 */
	public $codigo_status;
	/**
	 * Descrição do status do processamento.<BR>Essa tag explica o resultado da tag 'cCodigoStatus'.
	 *
	 * @var string
	 */
	public $descricao_status;
}

/**
 * Erro gerado pela aplicação.
 *
 * @pw_element integer $code Codigo do erro
 * @pw_element string $description Descricao do erro
 * @pw_element string $referer Origem do erro
 * @pw_element boolean $fatal Indica se eh um erro fatal
 * @pw_complex omie_fail
 */
if (!class_exists('omie_fail')) {
class omie_fail{
	/**
	 * Codigo do erro
	 *
	 * @var integer
	 */
	public $code;
	/**
	 * Descricao do erro
	 *
	 * @var string
	 */
	public $description;
	/**
	 * Origem do erro
	 *
	 * @var string
	 */
	public $referer;
	/**
	 * Indica se eh um erro fatal
	 *
	 * @var boolean
	 */
	public $fatal;
}
}