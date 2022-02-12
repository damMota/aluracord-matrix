import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState } from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import {ButtonSendSticker} from '../src/components/ButtonSendSticker';
import { Audio, Grid } from  'react-loader-spinner';

const SUPABASE_AMON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM4MDI1OCwiZXhwIjoxOTU4OTU2MjU4fQ.HSMGdPeHuC2spOYom-smZmUCjUhesNh65-_znlgq4a0';
const SUPABASE_URL = 'https://lwiusliytcpxbnapfcwt.supabase.co';
const supabaseClient = createClient(SUPABASE_URL,SUPABASE_AMON_KEY);

function escutaMensagemEmTempoReal(refrashNovaMensagem){
    return supabaseClient
    .from('mensagens')
    .on('INSERT', (respostaLive) => {
        refrashNovaMensagem(respostaLive.new);
        console.log('entrou nova msg');
    })
    .on('DELETE', (respostaLive) => {
        console.log('Houve uma exclusão de msg: ', respostaLive)
    })
    .subscribe();
}

export default function ChatPage() {
    /*
    //usuario
    -usuario digita no campo texarea
    -aperta enter para enviar
    -tem que adicionar o texto na lista mensagem

    //Dev
    -[x] campo criado
    -[] vamos usar o onChange e useState (ter if para caso seja enter para lipar a variavel)
    -[] lista de mensagens
    */
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMEnsagens] = React.useState([]);


    React.useEffect(() => {
        supabaseClient
        .from('mensagens')
        .select('*')
        .order('id',{ascending: false})
        .then(({data}) => {
            setListaDeMEnsagens(data)
        });

        escutaMensagemEmTempoReal((novaMensagem) => {
            //não pode enviar para o banco, apenas mostra na tela
            //handleNovaMensagem(novaMensagem);
            
            console.log('listaDeMEnsagens: ', listaDeMensagens);
            //está pegando listaDeMensagens inicial - não encherga a alteração feita no select anterior
            // setListaDeMEnsagens([
            //     novaMensagem,
            //     ...listaDeMensagens,
            // ])

            setListaDeMEnsagens((currentValue) => { //traz o valor atual da listaDeMensagens e concatena com a nova
                return [
                    novaMensagem,
                    ...currentValue,
                ]
            })
        });

    },[])

    const handleNovaMensagem = (novaMensagem) => {
        const mensagem = {
            //id: listaDeMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem
        }
        supabaseClient
        .from('mensagens')
        .insert([
            mensagem
        ])
        .then(({ data }) => {
        //     // console.log('Criando mensagem: ', data[0]);
        //     setListaDeMEnsagens([
        //         data[0],
        //         ...listaDeMensagens,
        // ])

            
        });
        setMensagem('');
    }
    
    function handleDeleteMassageSoTela (msg){
        const result = listaDeMensagens.filter(deleteIndece);
        function deleteIndece(msgFiltrada){
            return msgFiltrada != msg;
        }
        console.log('Filtered.', result);
        //reloadMessage(result);
       
    }

    const handleDeleteMensagem = async (novaMensagem) => {
        console.log("ID a ser apagado: ", novaMensagem.id);
        const { data, error } = await supabaseClient
        .from('mensagens')
        .delete()
        .match({ id: novaMensagem.id })
        // .then(({ data }) => {
            
        // })
        };


    const reloadMessage = (novoBloco) => {
        setListaDeMEnsagens(novoBloco);
    }

 
    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[501],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >
                    {/* {listaDeMensagens.map((msgatual) => {
                        // console.log(msgatual);
                        return(
                            <li key = {msgatual.id}>
                                {msgatual.de}:{msgatual.texto}
                            </li>
                        )
                    })} */}
                    <div style={{display: listaDeMensagens.length < 1 ? 'block' : 'none' }} >
                        <Carregando />
                    </div>

                    <MessageList mensagens={listaDeMensagens} deleteMsg={handleDeleteMensagem} carregarUpadate={reloadMessage} />


                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                // console.log(event);
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }

                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        {/* call back */}
                        <ButtonSendSticker onStickerClick ={ (sticker) => {
                            // console.log('uando componente.', sticker);
                            handleNovaMensagem(':sticker:'+sticker);
                        }}/>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function PerfilUsuario(props){
    const initDatauser = {
        id:1,
        name:"",
      }

    const [isHovering, setIsHovering] = useState(false);
    const mensagem = props.mensagens;
    const [datauser,setDataUser] = useState([initDatauser]);

   //console.log('Mensagem enviada: ',mensagem);

    const url = 'https://api.github.com/users/'+mensagem.de;

      React.useEffect(() => {
        fetch(url)
       .then(async(response) => {
        const lido =  await response.json();
        //   console.log('Conteúdo git:', lido );
          if(lido.id != datauser.id){
                 setDataUser(lido);
           } 
         
        })
      },[]);

    return(
        <>
             {!isHovering && 
            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                                onMouseOver={(event) => {
                                    // console.log(event);
                                    const valor = event.target.value;
                                    setIsHovering(true);
                                }}
                                onMouseOut ={(event) => {
                                    // console.log(event);
                                    const valor = event.target.value;
                                    setIsHovering(false);
                                }}
      
                            />
                            }
            {isHovering &&
            <>
                        <Box
                                as="form"
                                styleSheet={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    display: 'inline-block',
                                }}
                                onMouseOver={(event) => {
                                    // console.log(event);
                                    const valor = event.target.value;
                                    setIsHovering(true);
                                }}
                                onMouseOut ={(event) => {
                                    // console.log(event);
                                    const valor = event.target.value;
                                    setIsHovering(false);
                                }}
                        >
                            <Image
                                styleSheet={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '16px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                                
      
                            />
                            
                                <TextField
                                    value={datauser.name + "\n" +"Id: " + datauser.id + "\n" +"Desde: " + datauser.created_at}
                                    type="textarea"
                                    styleSheet={{
                                        width: '100%',
                                        border: '0',
                                        resize: 'none',
                                        borderRadius: '5px',
                                        padding: '6px 8px',
                                        backgroundColor: appConfig.theme.colors.neutrals[800],
                                        marginRight: '12px',
                                        color: appConfig.theme.colors.neutrals[200],
                                        display: 'inline-block',
                                    }}
                                />
                            </Box>
                        
            </>
            } 
                            </>
    )
}

function MessageList(props) {
    
// console.log('lista: ', props.mensagens);
 
function handleDelete (msg){
    const result = props.mensagens.filter(deleteIndece);
    function deleteIndece(msgFiltrada){
        return msgFiltrada != msg;
    }
    // console.log('Filtered.', result);
    props.carregarUpadate(result);
    props.deleteMsg(msg);
   
}
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {

                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            
                            <PerfilUsuario key={mensagem.id} mensagens={mensagem} />

                            <Text tag="strong"
                                styleSheet={{
                                display: 'inline-block',
                                 }}
                            >
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                    display: 'inline-block',
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                            <button className="btn" 
                                onClick={(event) => {
                                    handleDelete(mensagem);
                                }}
                            >
                            X
                            </button>
                       </Box>
                        {mensagem.texto.startsWith(':sticker:')
                        ?(
                            <Image src={mensagem.texto.replace(':sticker:','')} />
                        ) : (
                        mensagem.texto
                        )}
                    </Text>
                );
            })}
        </Box>
    )
}
function Carregando (props) {
    return (
    <Grid
    heigth="100"
    width="100"
    color='grey'
    ariaLabel='loading'
    
/>)
}
