/**
 * Executa o agendamento de exame 
 * @param {prontuariounificado.AgendarConsulta} agendarConsulta - Transacao de agendamento de consulta
 * @transaction
 */

 async function agendarConsulta(transacao) {
     const namespace = "prontuariounificado";
     console.log("Entrando na transacao de agendar consulta!");

     // valida se data de consulta é maior que hoje
     const dataConsulta = transacao.dataConsulta;
     let dataSistema = new Date();

     if(dataConsulta <= dataSistema) {
         throw new Error("Data do agendamento deve ser maior que hoje!");
     }

     // cria a consulta no blockchain
     const factory = getFactory();
     let   consultaMedica = factory.newResource(namepsace, "ConsultaMedica", transacao.idConsulta);

     consultaMedica.dataAgendamento = transacao.dataConsulta;
     consultaMedica.medicoAtendente = transacao.medicoAtendente;
     
     const consultaMedicaRegistry = await getAssetRegistry(consultaMedica.getFullyQualifiedType());
     await consultaMedicaRegistry.add(consultaMedica);

     // adiciona a consulta no prontuario do paciente
     const prontuarioRegistry = await getAssetRegistry(namespace + ".ProntuarioPaciente");
     const prontuario = transacao.prontuarioPaciente;

     if(!prontuario.consultasMedicas) {
         prontuario.consultasMedicas = [];
     }
     
     prontuario.consultasMedicas.push(factory.newRelationship(namespace, "ConsultaMedica", consultaMedica.getIdentifier()));
     await prontuarioRegistry.update(prontuario)

 }





 /**
 * Inicializa blockchain com uma estrutura de pacientes/medicos/convenios
 * @param {prontuariounificado.InicializacaoDemo} iniciarDemo - Transacao para demo
 * @transaction
 */
async function iniciarDemo() {

     const initData = {
        "medicos": [
            {"cpf": "12345678901" , 
             "nome" : "Dr. Ancelmo" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "0223445"
            },
            {"cpf": "12345678922" , 
             "nome" : "Dr. Elmo" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "02234332"
            },
            {"cpf": "09876543211" , 
             "nome" : "Dr. Marcos" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "234321"
            },
            {"cpf": "111111111111" , 
             "nome" : "Dra. Eliane" , 
             "endereco" : {
                 "logradouro":"Rua das Merces", 
                 "numero" : "224",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18112-655"
             },
             "crm" : "221"
            }
        ],
        "pacientes": [
         {   "cpf": "33299448897" , 
             "nome" : "Marcos Tadeu Brisola Vieira" , 
             "endereco" : {
                 "logradouro":"Rua Heitor Penteado", 
                 "numero" : "1900",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18015-655"
             }
         },
         {   "cpf": "32213537828" , 
             "nome" : "Ana Beatriz de Queiroz Morelli" , 
             "endereco" : {
                 "logradouro":"Rua Paulista", 
                 "numero" : "357",
                 "cidade" : "Indaiatuba", 
                 "estado": "SP",
                 "cep" : "18400-000"
             }
         }
        ],
        "convenios": [
            {
                "cnpj" : "345.315.001/0001-01",
                "nome" : "NIMED",
                "endereco" : {
                    "logradouro":"Avenida Paulista", 
                    "numero" : "3572",
                    "complemento" : "7. Andar",
                    "cidade" : "Sao Paulo", 
                    "estado": "SP",
                    "cep" : "18400-000"
                 },
                 "registroAns" : "134512"
            },
            {
             "cnpj" : "345.334.001/0001-99",
             "nome" : "DESCOBRA",
             "endereco" : {
                 "logradouro":"Avenida Paulista", 
                 "numero" : "3572",
                 "complemento" : "8. Andar",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18400-000"
              },
              "registroAns" : "13123432"
            }
        ],
        "laboratorios" : [
         {
             "cnpj" : "228.334.007/0001-75",
             "nome" : "Labclin",
             "endereco" : {
                 "logradouro":"Rua Paraiso", 
                 "numero" : "357",
                 "cidade" : "Sao Paulo", 
                 "estado": "SP",
                 "cep" : "18400-000"
              },
              "crmResponsavel" : "98476"
            }
        ]
     }


     const factory = getFactory();
     const medicoRegistry = await getAssetRegistry("prontuariounificado.Medico");

     for(const medico in initData.medicos) {
         const novoMedico = factory.newResource("prontuariounificado", "Medico", medico.cpf);
         novoMedico.nome = medico.nome;
         novoMedico.crm = medico.crm;
         let endereco = factory.newConcept("prontuariounificado", "Endereco");
         endereco.logradouro = medico.endereco.logradouro;
         endereco.numero = medico.endereco.numero;
         if(medico.endereco.complemento) {
             endereco.complemento = medico.endereco.complemento;
         }
         endereco.cidade = medico.endereco.cidade;
         endereco.estado = medico.endereco.estado;
         endereco.cep    = medico.endereco.cep;

         novoMedico.endereco = endereco;
         novoMedico.crm      = medico.crm;

         await medicoRegistry.add(novoMedico);

     }

}
