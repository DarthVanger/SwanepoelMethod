<?php
    
namespace SwanepoelMethod\Bundle\MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use SwanepoelMethod\Bundle\MainBundle\Entity\ExperimentalData;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Templating\Helper\AssetsHelper;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('SwanepoelMethodMainBundle:Default:index.html.twig');
    }

    public function uploadAction(Request $request)
    {
        $form = $this->container->get('form.factory')
            ->createNamedBuilder(null, 'form', null, array('csrf_protection' => false))
            ->add('file','file')
            ->add('directory','text')
            ->getForm();

        $form->handleRequest($request);

        if ($form->isValid()) {

            // choose sub directory 
            $data = $form->getData();
            if (isset($data['directory'])) {
               $uploadSubFolder = $data['directory'];
            } else {
                $uploadSubFolder = 'misc';
            }
            $dir = 'uploadedFiles/' . $uploadSubFolder . '/';

            $file = $form['file']->getData();
            $filename = $file->getClientOriginalName();
            $file->move($dir, $filename);

            // copy file to 'lastUploaded.csv'
            try {
              $fs = new Filesystem();
              $fs->copy($dir.$filename, $dir.'lastUploaded.csv', true);
            } catch(Exception $ex) {
                return new Response($ex->getMessage()); 
            }

            $response = array('uploadedFileName' => $filename);
            return new Response(json_encode($response));
        } else {
            if ($form->isSubmitted()) {
                $message = '';
                foreach($form->getErrors() as $error) {
                  $message .= $error->getMessage();
                }
                return new Response('form is submitted. But there are errors:' . $message);
            } else {
                return new Response('<html><body>form is not submitted</html></body>');
            }
        }
    }

    public function getUploadedFileContentsAction($filename)
    {
      $filepath = $path = $this->get('kernel')->getRootDir() . '/../web/uploadedFiles/' . $filename;
      if(file_exists($filepath)) {
          $responseContent = file_get_contents($filepath);
      } else {
          $responseContent = 'file named "'.$filename.'" not found on server. path = ' .$filepath;
      }
      return new Response($responseContent); 
    }

    public function viewUploadedFileContentsAction($filename)
    {
      $filepath = $path = $this->get('kernel')->getRootDir() . '/../web/uploadedFiles/' . $filename;
      if(file_exists($filepath)) {
          $responseContent = '<pre>' . file_get_contents($filepath) . '</pre>';
      } else {
          $responseContent = 'file named "'.$filename.'" not found on server. path = ' .$filepath;
      }
      return new Response($responseContent); 
    }

    public function saveFileAction(Request $request) {
      $jsonData = $request->getContent();
      $data = json_decode($jsonData);
      //$data = new \stdClass();
      //$data->fileContents = 'bla bla lba test';
      //$data->filename = 'test1.csv';
      //$data->directory = '';
      if (isset($data->directory)) {
        $dir = 'uploadedFiles/' . $data->directory . '/';
      } else {
        $dir = 'uploadedFiles/savedFiles/';
      }

      if (!file_exists($dir)) {
          mkdir($dir);
      }

      file_put_contents($dir . $data->filename, $data->fileContents);
      // put a copy also
      file_put_contents($dir . 'lastUploaded.csv', $data->fileContents);

      return new Response('File successefully saved to ' . $dir . $data->filename);
    }
}
