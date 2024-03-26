# To start project

  npm install 

## install kafka

###  start kafka-server(make sure java latest version installed)

.\bin\windows\kafka-server-start.bat .\config\server.properties


###   start  zookeeper-server 
  
   .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties


###   Creating topics like withdraw,deposit,transfer,check-balance,new-account 

  kafka-topics.bat --create --topic new-account --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1

#### kafka producer

  .\bin\windows\kafka-console-producer.bat --broker-list localhost:9092 --topic myFirstKakfa

### kafka consumer

    .\bin\windows\kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic new-account --from-beginning



###  REDIS SERVER START

 sudo service redis-server restart

   redis-cli

  sudo service redis-server stop





  <!-- postman login --with-api-key PMAK-6601a524e5e6d40001341c53-7d68af44f0f6bf45a90fd320804c44e5fe -->


   <!-- postman collection run 29718741-90c1d655-1ce5-4351-943d-d0bd76e7b178 --iteration-count 100
 -->



