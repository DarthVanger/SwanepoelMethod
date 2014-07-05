<?php
    
namespace SwanepoelMethod\Bundle\MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use SwanepoelMethod\Bundle\MainBundle\Entity\ExperimentalData;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Templating\Helper\AssetsHelper;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('SwanepoelMethodMainBundle:Default:index.html.twig');
    }

    public function uploadAction(Request $request)
    {
        $experimentalData = new ExperimentalData(); 
        $form = $this->createFormBuilder($experimentalData)
            ->add('file', 'file')
            ->add('upload', 'submit')
            ->getForm();

        $form->handleRequest($request);

        if ($form->isValid()) {
            $file = $form['file']->getData();
            $dir = 'upload';
            $file->move($dir, $file->getClientOriginalName());
            return new Response('ababa gala maga valid');
        } else {
            //return $this->render('SwanepoelMethodMainBundle:Default:upload.html.twig', array('form' => $form->createView()));
            return new Response($request->__toString());
        }
    }
}
